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
import { CreateTeacherPaymentDto } from "./dto/create-teacher-payment.dto";
import { UpdateTeacherPaymentDto } from "./dto/update-teacher-payment.dto";
import { ApiOperation, ApiTags, ApiResponse } from "@nestjs/swagger";
import { TeacherPaymentService } from "./teacherPayment.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesEnum } from "src/common/enum";
import { ApiBearerAuth } from "@nestjs/swagger";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { successRes } from "../common/response/succesResponse"; // yo'lni o'zingizga moslashtiring

@ApiTags("teacher-payments")
// @ApiBearerAuth('access-token')
@Controller("teacher-payments")
// @UseGuards(JwtAuthGuard, RolesGuard)
export class TeacherPaymentController {
  constructor(private readonly teacherPaymentService: TeacherPaymentService) { }

  @Post()
  @Roles(RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  @ApiOperation({ summary: "O'qituvchiga to'lov qilish" })
  @ApiResponse({
    status: 201,
    description: "To'lov muvaffaqiyatli amalga oshirildi",
  })
  async create(@Body() createDto: CreateTeacherPaymentDto) {
    const result = await this.teacherPaymentService.create(createDto);
    return result;
  }

  @Get()
  // @Roles(RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  @ApiOperation({ summary: "Barcha to'lovlar ro'yxatini olish" })
  @ApiResponse({ status: 200, description: "Barcha to'lovlar ro'yxati" })
  async findAll() {
    const result = await this.teacherPaymentService.findAll();
    return result;
  }

  @Get("statistics")
  // @Roles(RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  @ApiOperation({ summary: "To'lovlar statistikasi" })
  @ApiResponse({
    status: 200,
    description: "Jami to'langan, to'lanmagan va bekor qilingan to'lovlar statistikasi",
  })
  async getStatistics() {
    const result = await this.teacherPaymentService.getStatistics();
    return result;
  }

  @Get(":id")
  @Roles(RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  @ApiOperation({ summary: "ID bo'yicha to'lov ma'lumotini olish" })
  @ApiResponse({ status: 200, description: "To'lov ma'lumoti topildi" })
  @ApiResponse({ status: 404, description: "To'lov topilmadi" })
  async findOne(@Param("id") id: string) {
    const result = await this.teacherPaymentService.findOne(+id);
    return result;
  }

  @Patch(":id")
  @Roles(RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  @ApiOperation({ summary: "To'lov ma'lumotini yangilash yoki bekor qilish" })
  @ApiResponse({ status: 200, description: "To'lov yangilandi" })
  async update(
    @Param("id") id: string,
    @Body() updateDto: UpdateTeacherPaymentDto
  ) {
    const result = await this.teacherPaymentService.update(+id, updateDto);
    return result;
  }

  @Delete(":id")
  @Roles(RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  @ApiOperation({ summary: "To'lovni o'chirish" })
  @ApiResponse({ status: 200, description: "To'lov o'chirildi" })
  async remove(@Param("id") id: string) {
    const result = await this.teacherPaymentService.remove(+id);
    return result;
  }
}
