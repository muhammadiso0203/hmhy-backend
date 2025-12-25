import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between } from "typeorm";
import {
  CURRENCY,
  PAYME_CONFIG,
  PAYME_CANCEL_REASON,
  PAYMENT_PROVIDERS,
  PAYME_CANCEL_REASON_MESSAGE,
  PaymeCancelReasonCode,
} from "src/common/constants/payment.constant";
import { PaymeParamsDto } from "./dto/payme-request.dto";
import { LessonService } from "../lesson/lesson.service";
import { NotificationService } from "../notification/notification.service";
import { Lesson } from "../lesson/entities/lesson.entity";
import { Student } from "../student/entities/student.entity";
import { Teacher } from "../teacher/entities/teacher.entity";
import { PaymeTransactionError } from "../common/errors/payment.error";
import { LessonStatus, PaymeError } from "../common/enum";
import { Transaction } from "../transaction/entities/transaction.entity";

// Payme tranzaksiya holatlari
enum PaymeTransactionState {
  Pending = 1,
  Paid = 2,
  PendingCanceled = -1,
  PaidCanceled = -2,
}

// Payme account maydonlari
class PaymeData {
  static LessonId = "lesson_id";
  static StudentId = "student_id";
}

// Tranzaksiya ushlab turish muddati — 12 daqiqa
const TRANSACTION_HOLD_TIME = 12 * 60 * 1000; // 720000 ms

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
    private readonly notificationService: NotificationService,
    private readonly lessonService: LessonService
  ) {}

  private isValidUUID(uuid: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  private decodeAccount(account: any): {
    lesson_id: string;
    student_id: string;
  } {
    try {
      let parsed: { lesson_id?: string; student_id?: string };

      if (typeof account === "string") {
        const decoded = Buffer.from(account, "base64").toString("utf-8");
        parsed = JSON.parse(decoded);
      } else if (typeof account === "object" && account !== null) {
        parsed = account;
      } else {
        throw new Error("Invalid account format");
      }

      if (!parsed.lesson_id || !parsed.student_id) {
        throw new Error("Missing lesson_id or student_id");
      }

      if (
        !this.isValidUUID(parsed.lesson_id) ||
        !this.isValidUUID(parsed.student_id)
      ) {
        throw new Error("Invalid UUID format");
      }

      return {
        lesson_id: parsed.lesson_id,
        student_id: parsed.student_id,
      };
    } catch (error) {
      this.logger.error("Failed to decode account:", error);
      throw new Error("Invalid account format");
    }
  }

  async checkPerformTransaction(params: PaymeParamsDto, id: string) {
    const { account, amount } = params;

    if (!account) {
      throw new PaymeTransactionError(
        "Could not perform operation",
        PaymeError.LessonNotFound,
        id,
        { field: PaymeData.LessonId }
      );
    }

    let decodedAccount: { lesson_id: string; student_id: string };
    try {
      decodedAccount = this.decodeAccount(account);
    } catch {
      throw new PaymeTransactionError(
        "Invalid account format",
        PaymeError.InvalidParams,
        id,
        { field: "account" }
      );
    }

    if (amount == null || typeof amount !== "number" || amount <= 0) {
      throw new PaymeTransactionError(
        "Invalid amount",
        PaymeError.InvalidAmount,
        id
      );
    }

    const lesson = await this.lessonRepository.findOne({
      where: { id: decodedAccount.lesson_id },
      relations: ["teacher"],
    });

    if (!lesson) {
      throw new PaymeTransactionError(
        "Could not perform operation",
        PaymeError.LessonNotFound,
        id,
        { field: PaymeData.LessonId }
      );
    }

    const student = await this.studentRepository.findOne({
      where: { id: decodedAccount.student_id },
    });

    if (!student) {
      throw new PaymeTransactionError(
        "Student not found",
        PaymeError.StudentNotFound,
        id,
        { field: PaymeData.StudentId }
      );
    }

    const amountInSom = Math.floor(amount / CURRENCY.TIYIN_TO_SOM);
    if (amountInSom !== Number(lesson.price)) {
      throw new PaymeTransactionError(
        "Invalid amount",
        PaymeError.InvalidAmount,
        id
      );
    }

    if (lesson.status !== LessonStatus.AVAILABLE) {
      throw new PaymeTransactionError(
        "Lesson is not available for booking",
        PaymeError.LessonNotAvailable,
        id,
        { field: PaymeData.LessonId }
      );
    }

    if (student.isBlocked) {
      throw new PaymeTransactionError(
        "Student is blocked",
        PaymeError.StudentBlocked,
        id,
        { field: PaymeData.StudentId }
      );
    }

    return true;
  }

  async checkTransaction(params: PaymeParamsDto, id: string) {
    const transaction = await this.transactionRepository.findOne({
      where: { id: params.id },
    });

    if (!transaction) {
      throw new PaymeTransactionError(
        "Transaction not found",
        PaymeError.TransactionNotFound,
        id
      );
    }

    return {
      create_time: Number(transaction.createTime),
      perform_time: transaction.performTime
        ? Number(transaction.performTime)
        : 0,
      cancel_time: transaction.cancelTime ? Number(transaction.cancelTime) : 0,
      transaction: transaction.paymeId,
      state: this.mapStateToPayme(transaction.state),
      reason: transaction.reason || null,
    };
  }

  async createTransaction(params: PaymeParamsDto, id: string) {
    const { account, time, amount } = params;

    await this.checkPerformTransaction(params, id);

    const decodedAccount = this.decodeAccount(account);
    const currentTime = Date.now();

    let transaction = await this.transactionRepository.findOne({
      where: { paymeId: params.id },
    });

    if (transaction) {
      if (transaction.state !== "PENDING") {
        throw new PaymeTransactionError(
          "Could not perform operation",
          PaymeError.CantDoOperation,
          id
        );
      }

      const timePassed = currentTime - Number(transaction.createTime);
      if (timePassed > TRANSACTION_HOLD_TIME) {
        const qr =
          this.transactionRepository.manager.connection.createQueryRunner();
        await qr.connect();
        await qr.startTransaction();
        try {
          await qr.manager.update(
            Transaction,
            { paymeId: params.id },
            {
              state: "PENDING_CANCELED",
              reason: PAYME_CANCEL_REASON_MESSAGE[PAYME_CANCEL_REASON.TIMEOUT],
              cancelTime: BigInt(currentTime),
            }
          );
          await qr.manager.update(
            Lesson,
            { id: transaction.lessonId },
            { studentId: null as any }
          );
          await qr.commitTransaction();
        } catch {
          await qr.rollbackTransaction();
        } finally {
          await qr.release();
        }
        throw new PaymeTransactionError(
          "Could not perform operation",
          PaymeError.CantDoOperation,
          id
        );
      }

      return {
        create_time: Number(transaction.createTime),
        transaction: transaction.paymeId,
        state: PaymeTransactionState.Pending,
      };
    }

    const qr =
      this.transactionRepository.manager.connection.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const newTransaction = qr.manager.create(Transaction, {
        paymeId: params.id,
        state: "PENDING",
        amount: Math.floor((amount as number) / CURRENCY.TIYIN_TO_SOM),
        lessonId: decodedAccount.lesson_id,
        studentId: decodedAccount.student_id,
        createTime: BigInt(time as number),
        provider: PAYMENT_PROVIDERS.PAYME,
      });

      const saved = await qr.manager.save(newTransaction);

      await qr.manager.update(
        Lesson,
        { id: decodedAccount.lesson_id },
        {
          studentId: decodedAccount.student_id,
        }
      );

      await qr.commitTransaction();

      return {
        create_time: Number(saved.createTime),
        transaction: saved.paymeId,
        state: PaymeTransactionState.Pending,
      };
    } catch (error) {
      await qr.rollbackTransaction();
      this.logger.error("Create transaction failed", error);
      throw new PaymeTransactionError(
        "Could not perform operation",
        PaymeError.CantDoOperation,
        id
      );
    } finally {
      await qr.release();
    }
  }

  async performTransaction(params: PaymeParamsDto, id: string) {
    const currentTime = Date.now();

    const transaction = await this.transactionRepository.findOne({
      where: { paymeId: params.id },
      relations: ["lesson", "lesson.teacher", "student"],
    });

    if (!transaction) {
      throw new PaymeTransactionError(
        "Transaction not found",
        PaymeError.TransactionNotFound,
        id
      );
    }

    if (transaction.state === "PAID") {
      return {
        perform_time: transaction.performTime
          ? Number(transaction.performTime)
          : 0,
        transaction: transaction.paymeId,
        state: PaymeTransactionState.Paid,
      };
    }

    if (transaction.state !== "PENDING") {
      throw new PaymeTransactionError(
        "Could not perform operation",
        PaymeError.CantDoOperation,
        id
      );
    }

    const timePassed = currentTime - Number(transaction.createTime);
    if (timePassed > TRANSACTION_HOLD_TIME) {
      const qr =
        this.transactionRepository.manager.connection.createQueryRunner();
      await qr.connect();
      await qr.startTransaction();
      try {
        await qr.manager.update(
          Transaction,
          { paymeId: params.id },
          {
            state: "PENDING_CANCELED",
            reason: "Timeout",
            cancelTime: BigInt(currentTime),
          }
        );
        await qr.manager.update(
          Lesson,
          { id: transaction.lessonId },
          { studentId: null as any }
        );
        await qr.commitTransaction();
      } catch {
        await qr.rollbackTransaction();
      } finally {
        await qr.release();
      }
      throw new PaymeTransactionError(
        "Could not perform operation",
        PaymeError.CantDoOperation,
        id
      );
    }

    const qr =
      this.transactionRepository.manager.connection.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      await qr.manager.update(
        Transaction,
        { paymeId: params.id },
        {
          state: "PAID",
          performTime: BigInt(currentTime),
        }
      );

      await qr.manager
        .createQueryBuilder()
        .update(Lesson)
        .set({
          studentId: transaction.studentId,
          status: "booked",
          bookedAt: new Date(),
        })
        .where("id = :lessonId", { lessonId: transaction.lessonId })
        .execute();

      await qr.commitTransaction();
    } catch (error) {
      await qr.rollbackTransaction();
      this.logger.error("Perform transaction failed", error);
      throw new PaymeTransactionError(
        "Could not perform operation",
        PaymeError.CantDoOperation,
        id
      );
    } finally {
      await qr.release();
    }

    // Google Meet link yaratish
    try {
      if (
        transaction.lesson.teacher.googleAccessToken &&
        transaction.lesson.teacher.googleRefreshToken
      ) {
        const meetLink = await (
          this.lessonService as any
        )?.googleCalendarService?.createMeetLink(
          transaction.lesson.teacher.googleAccessToken,
          transaction.lesson.teacher.googleRefreshToken,
          transaction.lesson.googleEventId,
          transaction.lesson.teacherId
        );

        if (meetLink) {
          await this.lessonRepository.update(
            { id: transaction.lessonId },
            { meetingUrl: meetLink }
          );
        }
      }
    } catch (error) {
      if ((error as any)?.name === "GoogleOAuthError") {
        await this.teacherRepository.update(
          { id: transaction.lesson.teacherId },
          {
            googleAccessToken: null,
            googleRefreshToken: null,
          }
        );
      }
    }

    try {
      await this.notificationService.sendLessonBookingNotification(
        transaction.lessonId
      );
    } catch {
      // silent fail
    }

    const updated = await this.transactionRepository.findOne({
      where: { paymeId: params.id },
    });

    return {
      perform_time: updated?.performTime ? Number(updated.performTime) : 0,
      transaction: updated!.paymeId,
      state: PaymeTransactionState.Paid,
    };
  }

  async cancelTransaction(params: PaymeParamsDto, id: string) {
    const transaction = await this.transactionRepository.findOne({
      where: { paymeId: params.id },
    });

    if (!transaction) {
      throw new PaymeTransactionError(
        "Transaction not found",
        PaymeError.TransactionNotFound,
        id
      );
    }

    const currentTime = Date.now();

    if (transaction.state !== "PENDING" && transaction.state !== "PAID") {
      return {
        cancel_time: transaction.cancelTime
          ? Number(transaction.cancelTime)
          : currentTime,
        transaction: transaction.paymeId,
        state: this.mapStateToPayme(transaction.state),
      };
    }

    const newState =
      transaction.state === "PENDING" ? "PENDING_CANCELED" : "PAID_CANCELED";
    const isPaid = transaction.state === "PAID";

    const qr =
      this.transactionRepository.manager.connection.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      await qr.manager.update(
        Transaction,
        { paymeId: params.id },
        {
          state: newState,
          reason:
            params.reason != null
              ? PAYME_CANCEL_REASON_MESSAGE[
                  params.reason as PaymeCancelReasonCode
                ]
              : PAYME_CANCEL_REASON_MESSAGE[PAYME_CANCEL_REASON.USER_CANCELED],
          cancelTime: BigInt(currentTime),
        }
      );

      if (isPaid) {
        await qr.manager
          .createQueryBuilder()
          .update(Lesson)
          .set({
            studentId: null,
            status: "available",
            bookedAt: null,
          })
          .where("id = :id", { id: transaction.lessonId })
          .execute();
      } else {
        await qr.manager.update(
          Lesson,
          { id: transaction.lessonId },
          { studentId: null }
        );
      }

      await qr.commitTransaction();

      if (isPaid) {
        try {
          await (this.notificationService as any).sendNotificationToStudent?.(
            transaction.studentId,
            "❌ To'lov bekor qilindi\n\nSizning dars uchun to'lovingiz bekor qilindi. Iltimos, qaytadan urinib ko'ring yoki qo'llab-quvvatlash xizmatiga murojaat qiling."
          );
        } catch {}
      }
    } catch (error) {
      await qr.rollbackTransaction();
      this.logger.error("Cancel transaction failed", error);
      throw new PaymeTransactionError(
        "Could not perform operation",
        PaymeError.CantDoOperation,
        id
      );
    } finally {
      await qr.release();
    }

    return {
      cancel_time: currentTime,
      transaction: transaction.paymeId,
      state: this.mapStateToPayme(newState),
    };
  }

  async getStatement(params: PaymeParamsDto) {
    const { from, to } = params;

    const transactions = await this.transactionRepository.find({
      where: {
        createTime: Between(BigInt(from as number), BigInt(to as number)),
        provider: PAYMENT_PROVIDERS.PAYME,
      },
      relations: ["lesson", "student"],
    });

    return transactions.map((t) => ({
      id: t.paymeId,
      time: Number(t.createTime),
      amount: t.amount * CURRENCY.TIYIN_TO_SOM,
      account: {
        lesson_id: t.lessonId,
        student_id: t.studentId,
      },
      create_time: Number(t.createTime),
      perform_time: t.performTime ? Number(t.performTime) : 0,
      cancel_time: t.cancelTime ? Number(t.cancelTime) : 0,
      transaction: t.paymeId,
      state: this.mapStateToPayme(t.state),
      reason: t.reason || null,
    }));
  }

  private generatePaymentUrl(
    lessonId: string,
    studentId: string,
    amount: number,
    callbackUrl?: string
  ): string {
    const account = {
      lesson_id: lessonId,
      student_id: studentId,
      ...(callbackUrl && { callback: callbackUrl }),
    };

    const accountBase64 = Buffer.from(JSON.stringify(account)).toString(
      "base64"
    );
    const amountInTiyin = amount * CURRENCY.TIYIN_TO_SOM;

    const searchParams = new URLSearchParams({
      m: PAYME_CONFIG.MERCHANT_ID,
      ac: accountBase64,
      a: amountInTiyin.toString(),
    });

    if (callbackUrl) {
      searchParams.append("c", callbackUrl);
    }

    return `${PAYME_CONFIG.ENDPOINT}?${searchParams.toString()}`;
  }

  async initiatePayment(lessonId: string, studentId: string) {
    try {
      const lesson = await this.lessonRepository.findOne({
        where: { id: lessonId },
      });
      if (!lesson) return { status_code: 404, message: "Lesson not found" };

      if (lesson.status !== "available")
        return { status_code: 400, message: "Lesson is not available" };

      const student = await this.studentRepository.findOne({
        where: { id: studentId },
      });
      if (!student) return { status_code: 404, message: "Student not found" };

      if (student.isBlocked)
        return { status_code: 403, message: "Student account is blocked" };

      const paymentUrl = this.generatePaymentUrl(
        lessonId,
        studentId,
        lesson.price
      );

      return {
        status_code: 200,
        message: "Payment initiated",
        data: { paymentUrl, amount: lesson.price, lessonId },
      };
    } catch (error) {
      this.logger.error("Payment initiation error:", error);
      return { status_code: 500, message: "Failed to initiate payment" };
    }
  }

  async checkPaymentStatus(lessonId: string, studentId: string) {
    try {
      const transaction = await this.transactionRepository.findOne({
        where: { lessonId, studentId, provider: PAYMENT_PROVIDERS.PAYME },
        order: { createdAt: "DESC" },
      });

      if (!transaction)
        return { status_code: 404, message: "Transaction not found" };

      return {
        status_code: 200,
        data: {
          state: transaction.state,
          isPaid: transaction.state === "PAID",
          isCanceled: ["PENDING_CANCELED", "PAID_CANCELED"].includes(
            transaction.state
          ),
        },
      };
    } catch (error) {
      this.logger.error("Check payment status error:", error);
      return { status_code: 500, message: "Failed to check payment status" };
    }
  }

  private mapStateToPayme(state: string): number {
    switch (state) {
      case "PENDING":
        return PaymeTransactionState.Pending;
      case "PAID":
        return PaymeTransactionState.Paid;
      case "PENDING_CANCELED":
        return PaymeTransactionState.PendingCanceled;
      case "PAID_CANCELED":
        return PaymeTransactionState.PaidCanceled;
      default:
        return PaymeTransactionState.Pending;
    }
  }

  // Quyidagi admin metodlari o‘zgarmadi, faqat type safety saqlandi
  async getAdminTransactions(filters: any) {
    const {
      page = 1,
      limit = 20,
      state,
      provider,
      studentId,
      lessonId,
      teacherId,
      search,
      startDate,
      endDate,
      sortBy = "createdAt",
      sortDirection = "desc",
    } = filters;

    const queryBuilder = this.transactionRepository
      .createQueryBuilder("transaction")
      .leftJoinAndSelect("transaction.lesson", "lesson")
      .leftJoinAndSelect("lesson.teacher", "teacher")
      .leftJoinAndSelect("transaction.student", "student");

    if (state && state !== "ALL")
      queryBuilder.andWhere("transaction.state = :state", { state });
    if (provider && provider !== "ALL")
      queryBuilder.andWhere("transaction.provider = :provider", { provider });
    if (studentId)
      queryBuilder.andWhere("transaction.studentId = :studentId", {
        studentId,
      });
    if (lessonId)
      queryBuilder.andWhere("transaction.lessonId = :lessonId", { lessonId });
    if (teacherId)
      queryBuilder.andWhere("lesson.teacherId = :teacherId", { teacherId });

    if (search) {
      queryBuilder.andWhere(
        "(transaction.paymeId ILIKE :search OR transaction.clickId ILIKE :search OR student.firstname ILIKE :search OR student.lastname ILIKE :search OR student.phone ILIKE :search OR teacher.name ILIKE :search)",
        { search: `%${search}%` }
      );
    }

    if (startDate)
      queryBuilder.andWhere("transaction.createdAt >= :startDate", {
        startDate: new Date(startDate),
      });
    if (endDate)
      queryBuilder.andWhere("transaction.createdAt <= :endDate", {
        endDate: new Date(endDate),
      });

    const total = await queryBuilder.getCount();

    const transactions = await queryBuilder
      .orderBy(
        `transaction.${sortBy}`,
        sortDirection.toUpperCase() as "ASC" | "DESC"
      )
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    // Summary (filterlarni qo‘shishni unutmang)
    const allForSummary = await this.transactionRepository.find(); // realda filter qo‘shing
    const summary = {
      totalAmount: allForSummary.reduce((sum, t) => sum + t.amount, 0),
      paidAmount: allForSummary
        .filter((t) => t.state === "PAID")
        .reduce((sum, t) => sum + t.amount, 0),
      pendingAmount: allForSummary
        .filter((t) => t.state === "PENDING")
        .reduce((sum, t) => sum + t.amount, 0),
      canceledAmount: allForSummary
        .filter((t) => ["PENDING_CANCELED", "PAID_CANCELED"].includes(t.state))
        .reduce((sum, t) => sum + t.amount, 0),
      totalTransactions: allForSummary.length,
      paidTransactions: allForSummary.filter((t) => t.state === "PAID").length,
      pendingTransactions: allForSummary.filter((t) => t.state === "PENDING")
        .length,
      canceledTransactions: allForSummary.filter((t) =>
        ["PENDING_CANCELED", "PAID_CANCELED"].includes(t.state)
      ).length,
    };

    return {
      data: transactions.map((t) => ({
        id: t.id,
        paymeId: t.paymeId,
        clickId: t.clickId,
        provider: t.provider,
        amount: t.amount,
        state: t.state,
        createTime: new Date(Number(t.createTime)).toISOString(),
        performTime: t.performTime
          ? new Date(Number(t.performTime)).toISOString()
          : null,
        cancelTime: t.cancelTime
          ? new Date(Number(t.cancelTime)).toISOString()
          : null,
        reason: t.reason,
        lesson: t.lesson
          ? {
              id: t.lesson.id,
              startTime: t.lesson.startTime.toISOString(),
              endTime: t.lesson.endTime.toISOString(),
              price: t.lesson.price,
              teacher: t.lesson.teacher,
            }
          : null,
        student: t.student,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      summary,
    };
  }

  async getAdminTransactionById(transactionId: string) {
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId },
      relations: ["lesson", "lesson.teacher", "student"],
    });

    if (!transaction) {
      return { status_code: 404, message: "Transaction not found" };
    }

    return {
      status_code: 200,
      data: {
        id: transaction.id,
        paymeId: transaction.paymeId,
        clickId: transaction.clickId,
        provider: transaction.provider,
        amount: transaction.amount,
        state: transaction.state,
        createTime: new Date(Number(transaction.createTime)).toISOString(),
        performTime: transaction.performTime
          ? new Date(Number(transaction.performTime)).toISOString()
          : null,
        cancelTime: transaction.cancelTime
          ? new Date(Number(transaction.cancelTime)).toISOString()
          : null,
        reason: transaction.reason,
        lesson: transaction.lesson
          ? {
              id: transaction.lesson.id,
              startTime: transaction.lesson.startTime.toISOString(),
              endTime: transaction.lesson.endTime.toISOString(),
              price: transaction.lesson.price,
              status: transaction.lesson.status,
              meetingUrl: transaction.lesson.meetingUrl,
              teacher: transaction.lesson.teacher
                ? {
                    id: transaction.lesson.teacher.id,
                    name: transaction.lesson.teacher.name,
                    email: transaction.lesson.teacher.email,
                    phone: transaction.lesson.teacher.phone,
                  }
                : null,
            }
          : null,
        student: transaction.student
          ? {
              id: transaction.student.id,
              firstname: transaction.student.firstName,
              lastname: transaction.student.lastName,
              phone: transaction.student.phoneNumber,
              email: transaction.student.email,
              telegramId: transaction.student.telegramId,
            }
          : null,
        createdAt: transaction.createdAt.toISOString(),
        updatedAt: transaction.updatedAt.toISOString(),
      },
    };
  }

  async getTransactionStatistics(startDate?: string, endDate?: string) {
    const queryBuilder =
      this.transactionRepository.createQueryBuilder("transaction");

    if (startDate)
      queryBuilder.andWhere("transaction.createdAt >= :startDate", {
        startDate: new Date(startDate),
      });
    if (endDate)
      queryBuilder.andWhere("transaction.createdAt <= :endDate", {
        endDate: new Date(endDate),
      });

    const transactions = await queryBuilder
      .select([
        "transaction.amount",
        "transaction.state",
        "transaction.provider",
        "transaction.createdAt",
      ])
      .getMany();

    const byProvider = {
      PAYME: { total: 0, paid: 0, pending: 0, canceled: 0 },
      CLICK: { total: 0, paid: 0, pending: 0, canceled: 0 },
    };

    transactions.forEach((t) => {
      const key = t.provider as "PAYME" | "CLICK";
      byProvider[key].total += t.amount;

      if (t.state === "PAID") byProvider[key].paid += t.amount;
      else if (t.state === "PENDING") byProvider[key].pending += t.amount;
      else byProvider[key].canceled += t.amount;
    });

    return {
      status_code: 200,
      data: {
        total: {
          amount: transactions.reduce((sum, t) => sum + t.amount, 0),
          count: transactions.length,
        },
        paid: {
          amount: transactions
            .filter((t) => t.state === "PAID")
            .reduce((sum, t) => sum + t.amount, 0),
          count: transactions.filter((t) => t.state === "PAID").length,
        },
        pending: {
          amount: transactions
            .filter((t) => t.state === "PENDING")
            .reduce((sum, t) => sum + t.amount, 0),
          count: transactions.filter((t) => t.state === "PENDING").length,
        },
        canceled: {
          amount: transactions
            .filter((t) =>
              ["PENDING_CANCELED", "PAID_CANCELED"].includes(t.state)
            )
            .reduce((sum, t) => sum + t.amount, 0),
          count: transactions.filter((t) =>
            ["PENDING_CANCELED", "PAID_CANCELED"].includes(t.state)
          ).length,
        },
        byProvider,
      },
    };
  }
}
