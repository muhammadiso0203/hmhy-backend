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
import { CreateLessonHistoryDto } from "./dto/create-lesson-history.dto";
import { UpdateLessonHistoryDto } from "./dto/update-lesson-history.dto";
import { ApiOperation, ApiTags, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesEnum, TeacherRole } from "../common/enum";
import { LessonHistoryService } from "./lessonHistory.service";
import { successRes } from "../common/response/succesResponse"; // yo'lni o'zingizga moslashtiring

@ApiTags("lesson-history")
@Controller("lesson-history")
@UseGuards(JwtAuthGuard,RolesGuard)
@ApiBearerAuth("access-token")
export class LessonHistoryController {
  constructor(private readonly lessonHistoryService: LessonHistoryService) { }

  @Post()
  @Roles(RolesEnum.ADMIN, TeacherRole.TEACHER, RolesEnum.SUPER_ADMIN)
  @ApiOperation({ summary: "Dars tarixini yaratish" })
  @ApiResponse({
    status: 201,
    description: "Dars tarixi muvaffaqiyatli yaratildi",
  })
  @ApiResponse({ status: 400, description: "Yaroqsiz ma'lumotlar" })
  async create(@Body() createDto: CreateLessonHistoryDto) {
    const result = await this.lessonHistoryService.create(createDto);
    return successRes(result, 201);
  }

  @Get()
  @Roles(RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  @ApiOperation({ summary: "Barcha darslar tarixini olish" })
  @ApiResponse({ status: 200, description: "Darslar tarixi ro'yxati" })
  async findAll() {
    const result = await this.lessonHistoryService.findAll();
    return successRes(result);
  }

  @Get(":id")
  @Roles(RolesEnum.ADMIN, TeacherRole.TEACHER, RolesEnum.STUDENT, RolesEnum.SUPER_ADMIN)
  @ApiOperation({ summary: "ID bo'yicha dars tarixini olish" })
  @ApiResponse({ status: 200, description: "Dars tarixi topildi" })
  @ApiResponse({ status: 404, description: "Dars tarixi topilmadi" })
  async findOne(@Param("id") id: string) {
    const result = await this.lessonHistoryService.findOne(id);
    return successRes(result);
  }

  @Patch(":id")
  @Roles(RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  @ApiOperation({ summary: "Dars tarixini yangilash" })
  @ApiResponse({ status: 200, description: "Dars tarixi yangilandi" })
  async update(
    @Param("id") id: string,
    @Body() updateDto: UpdateLessonHistoryDto
  ) {
    const result = await this.lessonHistoryService.update(id, updateDto);
    return successRes(result);
  }

  @Delete(":id")
  @Roles(RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  @ApiOperation({ summary: "Dars tarixini o'chirish" })
  @ApiResponse({ status: 200, description: "Dars tarixi o'chirildi" })
  async remove(@Param("id") id: string) {
    const result = await this.lessonHistoryService.remove(id);
    return successRes(result);
  }
}
