import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from "@nestjs/common";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { UpdateTransactionDto } from "./dto/update-transaction.dto";
import { ApiOperation, ApiTags, ApiResponse } from "@nestjs/swagger";
import { TransactionService } from "./transaction.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesEnum } from "src/common/enum";
import { ApiBearerAuth } from "@nestjs/swagger";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { successRes } from "../common/response/succesResponse"; // yo'lni o'zingizga moslashtiring

@ApiTags("transactions")
// @ApiBearerAuth('access-token')
@Controller("transactions")
// @UseGuards(JwtAuthGuard, RolesGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) { }

  @Post()
  // @Roles(RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  @ApiOperation({ summary: "Yangi tranzaksiya yaratish" })
  @ApiResponse({
    status: 201,
    description: "Tranzaksiya muvaffaqiyatli yaratildi",
  })
  @ApiResponse({ status: 400, description: "Yaroqsiz ma'lumotlar" })
  async create(@Body() createDto: CreateTransactionDto) {
    const result = await this.transactionService.create(createDto);
    return result;
  }

  @Get()
  // @Roles(RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  @ApiOperation({ summary: "Barcha tranzaksiyalarni olish" })
  @ApiResponse({ status: 200, description: "Barcha tranzaksiyalar ro'yxati" })
  async findAll() {
    const result = await this.transactionService.findAll();
    return result;
  }

  @Get(":id")
  @Roles(RolesEnum.ADMIN, RolesEnum.STUDENT, RolesEnum.SUPER_ADMIN)
  @ApiOperation({ summary: "ID bo'yicha tranzaksiyani olish" })
  @ApiResponse({ status: 200, description: "Tranzaksiya topildi" })
  @ApiResponse({ status: 404, description: "Tranzaksiya topilmadi" })
  async findOne(@Param("id") id: string) {
    const result = await this.transactionService.findOne(id);
    return result;
  }

  @Patch(":id")
  @Roles(RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  @ApiOperation({ summary: "Tranzaksiyani yangilash" })
  @ApiResponse({ status: 200, description: "Tranzaksiya yangilandi" })
  async update(
    @Param("id") id: string,
    @Body() updateDto: UpdateTransactionDto
  ) {
    const result = await this.transactionService.update(id, updateDto);
    return result;
  }

  @Delete(":id")
  @Roles(RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  @ApiOperation({ summary: "Tranzaksiyani o'chirish" })
  @ApiResponse({ status: 200, description: "Tranzaksiya o'chirildi" })
  async remove(@Param("id") id: string) {
    const result = await this.transactionService.remove(id);
    return result;
  }
}
