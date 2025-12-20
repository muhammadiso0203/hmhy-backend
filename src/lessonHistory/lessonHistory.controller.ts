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
import { ApiOperation, ApiTags, ApiResponse } from "@nestjs/swagger";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { AdminGuard } from "../common/guards/admin.guard";
import { JwtSelfGuard } from "../common/guards/jwt-self.guard";
import { LessonHistoryService } from "./lessonHistory.service";
import { CreateLessonHistoryDto } from "./dto/create-lesson-history.dto";
import { UpdateLessonHistoryDto } from "./dto/update-lesson-history.dto";

@ApiTags("teachers")
@Controller("teachers")
export class TeachersController {
  constructor(private readonly teachersService: LessonHistoryService) {}

  //   @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Yangi o'qituvchi qo'shish" })
  @ApiResponse({
    status: 201,
    description: "O'qituvchi muvaffaqiyatli yaratildi",
  })
  @ApiResponse({ status: 400, description: "Yaroqsiz ma'lumotlar" })
  @Post()
  create(@Body() createLessonHistoryDto: CreateLessonHistoryDto) {
    return this.teachersService.create(createLessonHistoryDto);
  }

  //   @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Barcha o'qituvchilarni olish" })
  @ApiResponse({ status: 200, description: "O'qituvchilar ro'yxati" })
  @Get()
  findAll() {
    return this.teachersService.findAll();
  }

  @UseGuards(JwtAuthGuard, JwtSelfGuard)
  @ApiOperation({ summary: "ID bo'yicha bitta o'qituvchini olish" })
  @ApiResponse({ status: 200, description: "O'qituvchi topildi" })
  @ApiResponse({ status: 404, description: "O'qituvchi topilmadi" })
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.teachersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, JwtSelfGuard)
  @ApiOperation({ summary: "ID bo'yicha o'qituvchini yangilash" })
  @ApiResponse({ status: 200, description: "O'qituvchi yangilandi" })
  @Patch(":id")
  update(@Param("id") id: string, @Body() updateLessonHistoryDto: UpdateLessonHistoryDto) {
    return this.teachersService.update(id, updateLessonHistoryDto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "ID bo'yicha o'qituvchini o'chirish" })
  @ApiResponse({ status: 200, description: "O'qituvchi o'chirildi" })
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.teachersService.remove(id);
  }
}
