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
import { ApiOperation, ApiTags, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { AdminGuard } from "../common/guards/admin.guard";
import { JwtSelfGuard } from "../common/guards/jwt-self.guard";
import { CreateStudentDto } from "./dto/create-student.dto";
import { UpdateStudentDto } from "./dto/update-student.dto";
import { StudentsService } from "./student.service";
import { RolesGuard } from "src/common/guards/roles.guard";
import { Roles } from "src/common/decorators/roles.decorator";
import { RolesEnum } from "src/common/enum";

@ApiTags("students")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("students")
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @ApiOperation({ summary: "Yangi talaba qo'shish" })
  @ApiResponse({
    status: 201,
    description: "Talaba muvaffaqiyatli yaratildi",
  })
  @ApiResponse({ status: 400, description: "Yaroqsiz ma'lumotlar" })
  @Post()
  @ApiBearerAuth()
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentsService.create(createStudentDto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Roles(RolesEnum.SUPER_ADMIN)
  @ApiOperation({ summary: "Barcha talabalarni olish" })
  @ApiResponse({ status: 200, description: "Talabalar ro'yxati" })
  @Get()
  @ApiBearerAuth()
  findAll() {
    return this.studentsService.findAll();
  }
  
  @UseGuards(JwtAuthGuard, JwtSelfGuard)
  @ApiOperation({ summary: "ID bo'yicha bitta talabani olish" })
  @ApiResponse({ status: 200, description: "Talaba topildi" })
  @ApiResponse({ status: 404, description: "Talaba topilmadi" })
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.studentsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, JwtSelfGuard)
  @ApiOperation({ summary: "ID bo'yicha talabani yangilash" })
  @ApiResponse({ status: 200, description: "Talaba yangilandi" })
  @Patch(":id")
  update(@Param("id") id: string, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentsService.update(id, updateStudentDto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "ID bo'yicha talabani o'chirish" })
  @ApiResponse({ status: 200, description: "Talaba o'chirildi" })
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.studentsService.remove(id);
  }
}
