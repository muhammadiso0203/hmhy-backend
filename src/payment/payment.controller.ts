import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Query,
  Logger,
  Param,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
  ApiSecurity,
} from "@nestjs/swagger";
import { PaymentService } from "./payment.service";
import { AdminTransactionFilterDto } from "./dto/admin-transaction.dto";
import { AuthGuard } from "@nestjs/passport";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { PaymeTransactionError } from "../common/errors/payment.error";

@ApiTags("Payment")
@ApiBearerAuth("access-token")
@Controller("payment")
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(private readonly paymentService: PaymentService) {}

  /**
   * Payme merchant API endpoint
   * Payme tomonidan barcha so‘rovlar shu endpointga keladi
   */
  @Post("payme")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Payme JSON-RPC callback",
    description:
      "Payme to‘lov tizimidan keladigan barcha so‘rovlar shu endpoint orqali qayta ishlanadi",
  })
  @ApiBody({
    description: "Payme JSON-RPC so‘rovi",
    examples: {
      CreateTransaction: {
        summary: "CreateTransaction misoli",
        value: {
          jsonrpc: "2.0",
          method: "CreateTransaction",
          params: {
            id: "00000000000000012345",
            time: 1735123456789,
            amount: 15000000,
            account: { lesson_id: "uuid-lesson", student_id: "uuid-student" },
          },
          id: "00000000000000012345",
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "Muvaffaqiyatli javob yoki Payme xato formati",
  })
  @Post("payme")
  @HttpCode(HttpStatus.OK)
  async handlePaymeCallback(@Body() body: any) {
    try {
      this.logger.log("Payme so‘rovi keldi:", JSON.stringify(body));

      // 1. JSON-RPC versiyasini tekshirish
      if (!body.jsonrpc || body.jsonrpc !== "2.0") {
        return {
          jsonrpc: "2.0",
          error: {
            code: -32600,
            message: "Invalid Request",
            data: {
              uz: "Noto‘g‘ri JSON-RPC versiyasi",
              en: "Invalid JSON-RPC version",
            },
          },
          id: body.id || null,
        };
      }

      // 2. Majburiy maydonlarni tekshirish
      if (!body.method || !body.params || body.id === undefined) {
        return {
          jsonrpc: "2.0",
          error: {
            code: -32602,
            message: "Invalid params",
          },
          id: body.id || null,
        };
      }
      this.logger.log("Payme so‘rovi keldi:", JSON.stringify(body));

      const { method, params, id } = body;

      let result: any;

      switch (method) {
        case "CheckPerformTransaction":
          await this.paymentService.checkPerformTransaction(
            params,
            id as string
          );
          result = { allow: true };
          break;

        case "CheckTransaction":
          result = await this.paymentService.checkTransaction(
            params,
            id as string
          );
          break;

        case "CreateTransaction":
          result = await this.paymentService.createTransaction(
            params,
            id as string
          );
          break;

        case "PerformTransaction":
          result = await this.paymentService.performTransaction(
            params,
            id as string
          );
          break;

        case "CancelTransaction":
          result = await this.paymentService.cancelTransaction(
            params,
            id as string
          );
          break;

        case "GetStatement":
          const transactions = await this.paymentService.getStatement(params);
          result = { transactions };
          break;

        default:
          return {
            jsonrpc: "2.0",
            error: {
              code: -32601,
              message: "Method not found",
            },
            id,
          };
      }

      // Muvaffaqiyatli javob
      return {
        jsonrpc: "2.0",
        result,
        id,
      };
    } catch (error) {
      this.logger.error("Payme callback xatosi:", error);

      // Maxsus Payme xatosi bo‘lsa — to‘g‘ri formatda qaytar
      if (error instanceof PaymeTransactionError) {
        return error.toPaymeResponse();
      }

      // Boshqa barcha xatolar uchun umumiy xato
      return {
        jsonrpc: "2.0",
        error: {
          code: -32400,
          message: "System error",
        },
        id: body?.id || null,
      };
    }
  }

  /**
   * Frontend uchun to‘lov boshlash
   * Payme to‘lov sahifasiga yo‘naltirish URL sini qaytaradi
   */
  @Get("initiate")
  @ApiOperation({
    summary: "To‘lovni boshlash",
    description:
      "Frontenddan chaqiriladi. Payme to‘lov sahifasiga yo‘naltirish uchun URL qaytaradi",
  })
  @ApiQuery({
    name: "lessonId",
    type: String,
    description: "Dars ID (UUID)",
    example: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  })
  @ApiQuery({
    name: "studentId",
    type: String,
    description: "Talaba ID (UUID)",
    example: "a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8",
  })
  @ApiResponse({
    status: 200,
    description: "To‘lov URL muvaffaqiyatli qaytarildi",
    schema: {
      example: {
        status_code: 200,
        message: "Payment initiated",
        data: {
          paymentUrl: "https://checkout.payme.uz/...",
          amount: 150000,
          lessonId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: "Dars mavjud emas yoki band" })
  @ApiResponse({ status: 403, description: "Talaba bloklangan" })
  @ApiResponse({ status: 404, description: "Dars yoki talaba topilmadi" })
  async initiatePayment(
    @Query("lessonId") lessonId: string,
    @Query("studentId") studentId: string
  ) {
    return this.paymentService.initiatePayment(lessonId, studentId);
  }

  /**
   * To‘lov holatini tekshirish
   * Frontend polling orqali ishlatadi
   */
  @Get("status")
  @ApiOperation({
    summary: "To‘lov holatini tekshirish",
    description:
      "Frontend to‘lov muvaffaqiyatli bo‘lganini polling orqali tekshirish uchun",
  })
  @ApiQuery({ name: "lessonId", type: String, description: "Dars ID" })
  @ApiQuery({ name: "studentId", type: String, description: "Talaba ID" })
  @ApiResponse({
    status: 200,
    description: "Holat muvaffaqiyatli qaytarildi",
    schema: {
      example: {
        status_code: 200,
        data: {
          state: "PAID",
          isPaid: true,
          isCanceled: false,
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: "Tranzaksiya topilmadi" })
  async checkPaymentStatus(
    @Query("lessonId") lessonId: string,
    @Query("studentId") studentId: string
  ) {
    return this.paymentService.checkPaymentStatus(lessonId, studentId);
  }

  // ==================== ADMIN ENDPOINTS ====================

  @Get("admin/transactions")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("ADMIN", "SUPER_ADMIN")
  @ApiOperation({
    summary: "Admin: Barcha tranzaksiyalarni olish",
    description: "Filter, pagination va qidiruv bilan tranzaksiyalar ro‘yxati",
  })
  @ApiQuery({ name: "page", type: Number, required: false, example: 1 })
  @ApiQuery({ name: "limit", type: Number, required: false, example: 20 })
  @ApiQuery({
    name: "state", 
    type: String,
    required: false,
    enum: ["ALL", "PENDING", "PAID", "PENDING_CANCELED", "PAID_CANCELED"],
  })
  @ApiQuery({
    name: "provider",
    type: String,
    required: false,
    enum: ["ALL", "PAYME", "CLICK"],
  })
  @ApiQuery({
    name: "search",
    type: String,
    required: false,
    description: "paymeId, telefon, ism bo‘yicha qidiruv",
  })
  @ApiQuery({
    name: "startDate",
    type: String,
    format: "date",
    required: false,
  })
  @ApiQuery({ name: "endDate", type: String, format: "date", required: false })
  @ApiResponse({
    status: 200,
    description: "Tranzaksiyalar ro‘yxati va statistika",
  })
  @ApiResponse({ status: 401, description: "Autentifikatsiya talab qilinadi" })
  @ApiResponse({ status: 403, description: "Ruxsat yo‘q (faqat admin)" })
  async getAdminTransactions(@Query() filters: AdminTransactionFilterDto) {
    return this.paymentService.getAdminTransactions(filters);
  }

  @Get("admin/transactions/:id")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("ADMIN", "SUPER_ADMIN")
  @ApiOperation({
    summary: "Admin: Bitta tranzaksiya tafsilotlari",
    description:
      "Tranzaksiya ID bo‘yicha batafsil ma'lumot (talaba, dars, o‘qituvchi bilan)",
  })
  @ApiParam({
    name: "id",
    type: String,
    description: "Tranzaksiya ichki ID (UUID)",
  })
  @ApiResponse({ status: 200, description: "Tranzaksiya tafsilotlari" })
  @ApiResponse({ status: 404, description: "Tranzaksiya topilmadi" })
  @ApiResponse({ status: 401, description: "Autentifikatsiya talab qilinadi" })
  @ApiResponse({ status: 403, description: "Ruxsat yo‘q" })
  async getAdminTransactionById(@Param("id") transactionId: string) {
    return this.paymentService.getAdminTransactionById(transactionId);
  }

  @Get("admin/statistics")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("ADMIN", "SUPER_ADMIN")
  @ApiOperation({
    summary: "Admin: To‘lov statistikasi",
    description:
      "Dashboard uchun umumiy statistika (jami, to‘langan, kutilayotgan, bekor qilingan)",
  })
  @ApiQuery({
    name: "startDate",
    type: String,
    format: "date",
    required: false,
    example: "2025-01-01",
  })
  @ApiQuery({
    name: "endDate",
    type: String,
    format: "date",
    required: false,
    example: "2025-12-31",
  })
  @ApiResponse({
    status: 200,
    description: "Statistika muvaffaqiyatli qaytarildi",
  })
  @ApiResponse({ status: 401, description: "Autentifikatsiya talab qilinadi" })
  @ApiResponse({ status: 403, description: "Ruxsat yo‘q" })
  async getTransactionStatistics(
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string
  ) {
    return this.paymentService.getTransactionStatistics(startDate, endDate);
  }
}
