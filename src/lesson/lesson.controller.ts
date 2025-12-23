import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from "@nestjs/common";
import { ApiOperation, ApiTags, ApiResponse } from "@nestjs/swagger";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { LessonService } from "./lesson.service";
import { UpdateLessonDto } from "./dto/update-lesson.dto";
import { CreateLessonDto } from "./dto/create-lesson.dto";
import { LessonFilterDto } from "./dto/lesson-filter.dto";
import { DateRangeQueryDto } from "./dto/date-range-query.dto";
import { BookLessonDto } from "./dto/book-lesson.dto";
import { RateLessonDto } from "./dto/rate-lesson.dto";
import { CurrentUser } from "../common/decorators/currentUser";
import { IToken } from "../common/token/interface";

@ApiTags("lessons")
@Controller("lessons")
// @UseGuards(JwtAuthGuard, RolesGuard)
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

  @Roles("admin")
  @ApiOperation({ summary: "Get all lessons with filters (Admin only)" })
  @Get("admin/all")
  findAllAdmin(@Query() filters: LessonFilterDto) {
    return this.lessonsService.findAllAdmin(filters);
  }

  @Roles("admin")
  @ApiOperation({ summary: "Get teacher lessons (Admin only)" })
  @Get("admin/teacher/:teacherId")
  findByTeacherAdmin(
    @Param("teacherId") teacherId: string,
    @Query() filters: LessonFilterDto
  ) {
    return this.lessonsService.findByTeacherAdmin(teacherId, filters);
  }

  @Roles("teacher")
  @ApiOperation({ summary: "Get my lessons (Teacher only)" })
  @Get("teacher/my")
  findMyLessons(@CurrentUser() user: IToken) {
    return this.lessonsService.findMyLessons(user.id);
  }

  @Roles("teacher")
  @ApiOperation({ summary: "Get my booked lessons (Teacher only)" })
  @Get("teacher/my/booked")
  findMyBookedLessons(@CurrentUser() user: IToken) {
    return this.lessonsService.findMyBookedLessons(user.id);
  }

  @Roles("teacher")
  @ApiOperation({ summary: "Get my lessons by date range (for week calendar)" })
  @Get("teacher/my/by-date-range")
  findMyLessonsByDateRange(
    @CurrentUser() user: IToken,
    @Query() range: DateRangeQueryDto
  ) {
    return this.lessonsService.findMyByDateRange(user.id, range);
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

  @Roles("teacher")
  @ApiOperation({ summary: "Mark lesson as completed (Teacher only)" })
  @Patch(":id/complete")
  complete(
    @Param("id") id: string,
    @CurrentUser() user: IToken
  ) {
    return this.lessonsService.completeLesson(id, user.id);
  }

  @ApiOperation({
    summary: "Rate a completed lesson (Student via Telegram)",
  })
  @Post(":id/rate")
  rateLesson(@Param("id") id: string, @Body() dto: RateLessonDto) {
    return this.lessonsService.rateLesson(id, dto);
  }

  @Roles("admin")
  @ApiOperation({ summary: "Darsni o'chirib tashlash" })
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.lessonsService.remove(id);
  }
}
