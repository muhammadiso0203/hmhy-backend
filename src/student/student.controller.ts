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
import { CreateStudentDto } from "./dto/create-student.dto";
import { UpdateStudentDto } from "./dto/update-student.dto";
import { StudentsService } from "./student.service";
import { RolesGuard } from "src/common/guards/roles.guard";
import { Roles } from "src/common/decorators/roles.decorator";
import { RolesEnum, TeacherRole } from "src/common/enum";
import { BlockStudentDto } from "./dto/blockStudent.dto";
import { IToken } from "../common/token/interface";
import { CurrentUser } from "../common/decorators/currentUser";
import { JwtSelfGuard } from "src/common/guards/jwt-self.guard";

@ApiTags("students")
// @UseGuards(JwtAuthGuard, RolesGuard)
// @ApiBearerAuth("access-token")
@Controller("students")
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) { }

  @ApiOperation({ summary: "Yangi talaba qo'shish" })
  @ApiResponse({
    status: 201,
    description: "Talaba muvaffaqiyatli yaratildi",
  })
  @ApiResponse({ status: 400, description: "Yaroqsiz ma'lumotlar" })
  @Post()
  async create(@Body() createStudentDto: CreateStudentDto) {
    const result = await this.studentsService.create(createStudentDto);
    return result;
  }

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
  async stats() {
    const result = await this.studentsService.stats();
    return result
  }

  @Get("me")
  @ApiOperation({ summary: "Get current student profile" })
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

  @UseGuards(JwtAuthGuard, JwtSelfGuard)
  @Roles(RolesEnum.SUPER_ADMIN)
  @ApiOperation({ summary: "Student block" })
  @ApiResponse({ status: 200, description: "Student blocked" })
  @Post("block/:id")
  async blockStudent(
    @Param("id") id: string,
    @Body() blockStudentDto: BlockStudentDto
  ) {
    const result = await this.studentsService.blockStudent(id, blockStudentDto);
    return result
  }

  @UseGuards(JwtAuthGuard, JwtSelfGuard)
  @Roles(RolesEnum.SUPER_ADMIN)
  @ApiOperation({ summary: "Student unblock" })
  @ApiResponse({ status: 200, description: "Student unblocked" })
  @Post("unblock/:id")
  async unblockStudent(@Param("id") id: string) {
    const result = await this.studentsService.unblockStudent(id);
    return result
  }

  // @UseGuards(JwtAuthGuard, JwtSelfGuard)
  @ApiOperation({ summary: "ID bo'yicha bitta talabani olish" })
  @ApiResponse({ status: 200, description: "Talaba topildi" })
  @ApiResponse({ status: 404, description: "Talaba topilmadi" })
  @Get(":id")
  async findOne(@Param("id") id: string) {
    const result = await this.studentsService.findOne(id);
    return result
  }

  // @UseGuards(JwtAuthGuard, JwtSelfGuard)
  @ApiOperation({ summary: "ID bo'yicha talabani yangilash" })
  @ApiResponse({ status: 200, description: "Talaba yangilandi" })
  @Patch(":id")
  update(@Param("id") id: string, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentsService.update(id, updateStudentDto);
  }

  // @UseGuards(JwtAuthGuard, JwtSelfGuard)
  @ApiOperation({ summary: "ID bo'yicha talabani o'chirish" })
  @ApiResponse({ status: 200, description: "Talaba o'chirildi" })
  @Delete(":id")
  async remove(@Param("id") id: string) {
    const result = await this.studentsService.remove(id);
    return result
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
