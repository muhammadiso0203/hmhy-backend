import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateTeacherPaymentDto } from "./dto/create-teacher-payment.dto";
import { UpdateTeacherPaymentDto } from "./dto/update-teacher-payment.dto";
import { TeacherPayment } from "./entities/teacherPayment.entity";

@Injectable()
export class TeacherPaymentService {
  constructor(
    @InjectRepository(TeacherPayment)
    private readonly teacherPaymentRepository: Repository<TeacherPayment>
  ) { }

  async create(createDto: CreateTeacherPaymentDto) {
    const { teacher, ...rest } = createDto;
    const newPayment = this.teacherPaymentRepository.create({
      ...rest,
      teacherId: teacher, // DTO'dagi 'teacher' ni entity'dagi 'teacherId' ga mapping qilish
      paidAt: new Date(), // To'lov amalga oshirilgan vaqt
    });
    return await this.teacherPaymentRepository.save(newPayment);
  }

  async findAll() {
    return await this.teacherPaymentRepository.find({
      relations: ["teacher", "admin"], // Bog'liqliklarni qo'shib olish
    });
  }

  async findOne(id: number) {
    const payment = await this.teacherPaymentRepository.findOne({
      where: { id },
      relations: ["teacher", "admin"],
    });
    if (!payment) {
      throw new NotFoundException(`To'lov (ID: ${id}) topilmadi`);
    }
    return payment;
  }

  async update(id: number, updateDto: UpdateTeacherPaymentDto) {
    const payment = await this.findOne(id);

    // Agar to'lov bekor qilinayotgan bo'lsa, vaqtni belgilash
    if (updateDto.isCanceled && !payment.isCanceled) {
      updateDto.canceledAt = new Date();
    }

    Object.assign(payment, updateDto);
    return await this.teacherPaymentRepository.save(payment);
  }

  async remove(id: number) {
    const payment = await this.findOne(id);
    await this.teacherPaymentRepository.remove(payment);
    return { message: "To'lov tarixi o'chirildi" };
  }

  async getStatistics() {
    const allPayments = await this.teacherPaymentRepository.find();

    // Jami to'langan (paidAt mavjud va bekor qilinmagan)
    const paidPayments = allPayments.filter(
      (p) => p.paidAt !== null && !p.isCanceled
    );
    const totalPaidCount = paidPayments.length;
    const totalPaidAmount = paidPayments.reduce(
      (sum, p) => sum + p.totalLessonAmount,
      0
    );

    // Jami to'lanmagan (paidAt null va bekor qilinmagan)
    const unpaidPayments = allPayments.filter(
      (p) => p.paidAt === null && !p.isCanceled
    );
    const totalUnpaidCount = unpaidPayments.length;
    const totalUnpaidAmount = unpaidPayments.reduce(
      (sum, p) => sum + p.totalLessonAmount,
      0
    );

    // Bekor qilingan
    const canceledPayments = allPayments.filter((p) => p.isCanceled);
    const totalCanceledCount = canceledPayments.length;
    const totalCanceledAmount = canceledPayments.reduce(
      (sum, p) => sum + p.totalLessonAmount,
      0
    );

    return {
      totalPaid: {
        count: totalPaidCount,
        amount: totalPaidAmount,
      },
      totalUnpaid: {
        count: totalUnpaidCount,
        amount: totalUnpaidAmount,
      },
      canceled: {
        count: totalCanceledCount,
        amount: totalCanceledAmount,
      },
    };
  }
}
