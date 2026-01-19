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
import { ApiOperation, ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesEnum, TeacherRole } from "../common/enum";
import { LessonService } from "./lesson.service";
import { UpdateLessonDto } from "./dto/update-lesson.dto";
import { CreateLessonDto } from "./dto/create-lesson.dto";
import { LessonFilterDto } from "./dto/lesson-filter.dto";
import { DateRangeQueryDto } from "./dto/date-range-query.dto";
import { BookLessonDto } from "./dto/book-lesson.dto";
import { RateLessonDto } from "./dto/rate-lesson.dto";
import { CurrentUser } from "../common/decorators/currentUser";
import { IToken } from "../common/token/interface";
import { successRes } from "../common/response/succesResponse"; // yo'lni o'zingizga moslashtiring

@ApiTags("lessons")
@Controller("lessons")
// @UseGuards(JwtAuthGuard, RolesGuard)
// @ApiBearerAuth("access-token")
export class LessonController {
  constructor(private readonly lessonsService: LessonService) {}

  // @Roles(RolesEnum.ADMIN, TeacherRole.TEACHER, RolesEnum.SUPER_ADMIN)
  @ApiOperation({ summary: "Yangi dars yaratish" })
  @Post()
  async create(@Body() createLessonDto: CreateLessonDto) {
    const result = await this.lessonsService.create(createLessonDto);
    return result;
  }

  // @Roles(RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  @ApiOperation({ summary: "Barcha darslar ro'yxatini olish (Admin uchun)" })
  @Get()
  async findAll() {
    const result = await this.lessonsService.findAll();
    return result;
  }

  // @Roles(RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  @ApiOperation({ summary: "Get all lessons with filters (Admin only)" })
  @Get("admin/all")
  async findAllAdmin(@Query() filters: LessonFilterDto) {
    const result = await this.lessonsService.findAllAdmin(filters);
    return result;
  }

  // @Roles(RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  @ApiOperation({ summary: "Get teacher lessons (Admin only)" })
  @Get("admin/teacher/:teacherId")
  async findByTeacherAdmin(
    @Param("teacherId") teacherId: string,
    @Query() filters: LessonFilterDto
  ) {
    const result = await this.lessonsService.findByTeacherAdmin(
      teacherId,
      filters
    );
    return result;
  }

  // @Roles(TeacherRole.TEACHER, RolesEnum.SUPER_ADMIN)
  @ApiOperation({ summary: "Get my lessons (Teacher only)" })
  @Get("teacher/my")
  async findMyLessons(@CurrentUser() user: IToken) {
    const result = await this.lessonsService.findMyLessons(user.id);
    return result;
  }

  // @Roles(TeacherRole.TEACHER, RolesEnum.SUPER_ADMIN)
  @ApiOperation({ summary: "Get my booked lessons (Teacher only)" })
  @Get("teacher/my/booked")
  async findMyBookedLessons(@CurrentUser() user: IToken) {
    const result = await this.lessonsService.findMyBookedLessons(user.id);
    return result;
  }

  // @Roles(TeacherRole.TEACHER, RolesEnum.SUPER_ADMIN)
  @ApiOperation({ summary: "Get my lessons by date range (for week calendar)" })
  @Get("teacher/my/by-date-range")
  async findMyLessonsByDateRange(
    @CurrentUser() user: IToken,
    @Query() range: DateRangeQueryDto
  ) {
    const result = await this.lessonsService.findMyByDateRange(user.id, range);
    return result;
  }

  // @Roles(RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  @ApiOperation({ summary: "Get lesson statistics" })
  @Get("stats/all")
  async getStats() {
    const result = await this.lessonsService.getLessonStats();
    return successRes(result);
  }

  // @Roles(RolesEnum.ADMIN, TeacherRole.TEACHER, RolesEnum.STUDENT, RolesEnum.SUPER_ADMIN)
  @ApiOperation({ summary: "ID bo'yicha dars ma'lumotlarini olish" })
  @Get(":id")
  async findOne(@Param("id") id: string) {
    const result = await this.lessonsService.findOne(id);
    return result;
  }

  // @Roles(TeacherRole.TEACHER, RolesEnum.SUPER_ADMIN)
  @ApiOperation({ summary: "Dars ma'lumotlarini yangilash" })
  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() updateLessonDto: UpdateLessonDto
  ) {
    const result = await this.lessonsService.update(id, updateLessonDto);
    return result;
  }

  // @Roles(TeacherRole.TEACHER, RolesEnum.SUPER_ADMIN)
  @ApiOperation({ summary: "Mark lesson as completed (Teacher only)" })
  @Patch(":id/complete")
  async complete(@Param("id") id: string, @CurrentUser() user: IToken) {
    const result = await this.lessonsService.completeLesson(id, user.id);
    return result;
  }

  // @Roles(RolesEnum.STUDENT, TeacherRole.TEACHER, RolesEnum.SUPER_ADMIN)
  @ApiOperation({
    summary: "Rate a completed lesson (Student via Telegram)",
  })
  @Post(":id/rate")
  async rateLesson(@Param("id") id: string, @Body() dto: RateLessonDto) {
    const result = await this.lessonsService.rateLesson(id, dto);
    return result;
  }

  // @Roles(TeacherRole.TEACHER, RolesEnum.SUPER_ADMIN)
  @ApiOperation({ summary: "Darsni o'chirib tashlash" })
  @Delete(":id")
  async remove(@Param("id") id: string) {
    const result = await this.lessonsService.remove(id);
    return result;
  }
}
