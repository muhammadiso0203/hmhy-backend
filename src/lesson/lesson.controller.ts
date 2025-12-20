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
import { CreateLessonDto } from "./dto/create-lesson.dto";
import { UpdateLessonDto } from "./dto/update-lesson.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { LessonService } from "./lesson.service";

@ApiTags("lessons")
@Controller("lessons")
@UseGuards(JwtAuthGuard, RolesGuard)
export class LessonController {
  constructor(private readonly lessonsService: LessonService) {}

  @Roles("admin", "teacher")
  @ApiOperation({ summary: "Yangi dars yaratish" })
  @Post()
  create(@Body() createLessonDto: CreateLessonDto) {
    return this.lessonsService.create(createLessonDto);
  }

  @Roles("admin")
  @ApiOperation({ summary: "Barcha darslar ro'yxatini olish (Admin uchun)" })
  @Get()
  findAll() {
    return this.lessonsService.findAll();
  }

  @Roles("admin", "teacher", "student")
  @ApiOperation({ summary: "ID bo'yicha dars ma'lumotlarini olish" })
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.lessonsService.findOne(id);
  }

  @Roles("admin", "teacher")
  @ApiOperation({ summary: "Dars ma'lumotlarini yangilash" })
  @Patch(":id")
  update(@Param("id") id: string, @Body() updateLessonDto: UpdateLessonDto) {
    return this.lessonsService.update(id, updateLessonDto);
  }

  @Roles("admin")
  @ApiOperation({ summary: "Darsni o'chirib tashlash" })
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.lessonsService.remove(id);
  }
}
