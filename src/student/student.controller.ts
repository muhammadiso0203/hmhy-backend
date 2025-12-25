import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  NotFoundException,
  Request,
} from "@nestjs/common";
import {
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { AdminGuard } from "../common/guards/admin.guard";
import { JwtSelfGuard } from "../common/guards/jwt-self.guard";
import { CreateStudentDto } from "./dto/create-student.dto";
import { UpdateStudentDto } from "./dto/update-student.dto";
import { StudentsService } from "./student.service";
import { RolesGuard } from "src/common/guards/roles.guard";
import { Roles } from "src/common/decorators/roles.decorator";
import { RolesEnum } from "src/common/enum";
import { BlockStudentDto } from "./dto/blockStudent.dto";
import { IToken } from "../common/token/interface";
import { CurrentUser } from "../common/decorators/currentUser";

@ApiTags("students")
@ApiBearerAuth("access-token")
// @UseGuards(JwtAuthGuard, RolesGuard)
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
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentsService.create(createStudentDto);
  }

  // @UseGuards(JwtAuthGuard, AdminGuard)
  // @Roles(RolesEnum.SUPER_ADMIN)
  @ApiOperation({ summary: "Barcha talabalarni olish" })
  @ApiResponse({ status: 200, description: "Studentlar ro'yxati" })
  @Get()
  @ApiBearerAuth("access-token")
  findAll() {
    return this.studentsService.findAll();
  }

  // @UseGuards(JwtAuthGuard, JwtSelfGuard)
  // @Roles(RolesEnum.SUPER_ADMIN)
  @ApiOperation({ summary: "Students stats" })
  @ApiResponse({ status: 200, description: "Students stats" })
  @Get("stats")
  stats() {
    return this.studentsService.stats();
  }

  @Get("me")
  @ApiOperation({ summary: "Get current student profile" })
  @ApiBearerAuth("access-token")
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    description: "Get student profile successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getProfile(@CurrentUser() user: IToken) {
    const profile = await this.studentsService.getStudentProfileById(user.id);

    if (!profile) {
      throw new NotFoundException("Student profile not found");
    }

    return profile;
  }

  // @UseGuards(JwtAuthGuard, JwtSelfGuard)
  // @Roles(RolesEnum.SUPER_ADMIN)
  @ApiOperation({ summary: "Student block" })
  @ApiResponse({ status: 200, description: "Student blocked" })
  @Post("block/:id")
  blockStudent(
    @Param("id") id: string,
    @Body() blockStudentDto: BlockStudentDto
  ) {
    return this.studentsService.blockStudent(id, blockStudentDto);
  }

  // @UseGuards(JwtAuthGuard, JwtSelfGuard)
  // @Roles(RolesEnum.SUPER_ADMIN)
  @ApiOperation({ summary: "Student unblock" })
  @ApiResponse({ status: 200, description: "Student unblocked" })
  @Post("unblock/:id")
  unblockStudent(@Param("id") id: string) {
    return this.studentsService.unblockStudent(id);
  }

  // @UseGuards(JwtAuthGuard, JwtSelfGuard)
  @ApiOperation({ summary: "ID bo'yicha bitta talabani olish" })
  @ApiResponse({ status: 200, description: "Talaba topildi" })
  @ApiResponse({ status: 404, description: "Talaba topilmadi" })
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.studentsService.findOne(id);
  }

  // @UseGuards(JwtAuthGuard, JwtSelfGuard)
  @ApiOperation({ summary: "ID bo'yicha talabani yangilash" })
  @ApiResponse({ status: 200, description: "Talaba yangilandi" })
  @Patch(":id")
  update(@Param("id") id: string, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentsService.update(id, updateStudentDto);
  }

  // @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "ID bo'yicha talabani o'chirish" })
  @ApiResponse({ status: 200, description: "Talaba o'chirildi" })
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.studentsService.remove(id);
  }

  @Get(":chatId/lessons")
  async getStudentLessons(@Param("chatId") chatId: string) {
    const lessons = await this.studentsService.getLessonsByChatId(chatId);

    if (!lessons || lessons.length === 0) {
      throw new NotFoundException(`Bu talaba uchun darslar topilmadi.`);
    }

    return lessons;
  }

  @Get(":chatId/history")
  @ApiOperation({ summary: "Talabaning darslar tarixini olish" })
  @ApiResponse({ status: 200, description: "Tugatilgan darslar ro‘yxati" })
  async getHistory(@Param("chatId") chatId: string) {
    const history = await this.studentsService.getLessonHistory(chatId);
    if (!history) throw new NotFoundException("Tarix topilmadi");
    return history;
  }
}
