import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from "@nestjs/common";
import { TeacherService } from "./teacher.service";
import { UpdateTeacherDto } from "./dto/update-teacher.dto";
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiTags,
} from "@nestjs/swagger";
import { RolesEnum, TeacherRole } from "src/common/enum";
import { Roles } from "src/common/decorators/roles.decorator";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { CurrentUser } from "src/common/decorators/currentUser";
import { UpdateRatingDto } from "./dto/updateRating.dto";
import { UpdateTeacherMeDto } from "./dto/updateTeacherMe.dto";
import { IToken } from "src/common/token/interface";
import { successRes } from "src/common/response/succesResponse";
import { DeleteTeacherDto } from "./dto/delete-teacher.dto";

@ApiTags('Teacher')
@Controller('teacher')
// @UseGuards(JwtAuthGuard, RolesGuard)
// @ApiBearerAuth("access-token")
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) { }

  @Get()
  @ApiOperation({ summary: 'Get all teachers with full details' })
  @Roles(RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  // @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: "Get all teachers successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  async findAll() {
    const result = await this.teacherService.findAllTeachers();
    return result;
  }

  @Get('active')
  @ApiOperation({ summary: 'Get only active teachers (for students)' })
  @Roles('public')
  @ApiResponse({
    status: 200,
    description: "Get active teachers successfully",
  })
  async findActive() {
    const result = await this.teacherService.findActiveTeachers();
    return result;
  }

  @Get('deleted')
  @ApiOperation({ summary: 'Get all deleted teachers' })
  @Roles(RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  // @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: "Get deleted teachers successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  async findDeleted() {
    const result = await this.teacherService.findDeletedTeachers();
    return result;
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current teacher profile' })
  @Roles(TeacherRole.TEACHER, TeacherRole.ADMIN)
  // @ApiBearerAuth('access-token')
  @ApiResponse({
    status: 200,
    description: "Get teacher profile successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Teacher access required",
  })
  async getProfile(@CurrentUser() user: IToken) {
    const result = await this.teacherService.findTeacherProfile(user.id);
    return result;
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current teacher profile' })
  @Roles(TeacherRole.TEACHER, TeacherRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiBody({ type: UpdateTeacherMeDto })
  @ApiResponse({
    status: 200,
    description: "Profile updated successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Teacher access required",
  })
  async updateProfile(
    @CurrentUser() user: IToken,
    @Body() updateTeacherMeDto: UpdateTeacherMeDto
  ) {
    const result = await this.teacherService.updateTeacherProfile(
      user.id,
      updateTeacherMeDto
    );
    return result;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get teacher by ID' })
  @Roles('public')
  @ApiResponse({
    status: 200,
    description: "Get teacher successfully",
  })
  @ApiResponse({ status: 404, description: "Teacher not found" })
  async findOne(@Param("id", ParseUUIDPipe) id: string) {
    const result = await this.teacherService.findOne(id);
    return result;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update teacher (Admin, Teacher only)' })
  @Roles(RolesEnum.ADMIN, TeacherRole.TEACHER, TeacherRole.ADMIN, 'ID')
  @ApiBody({ type: UpdateTeacherDto })
  @ApiResponse({
    status: 200,
    description: "Teacher updated successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin or Teacher access required",
  })
  @ApiResponse({ status: 404, description: "Teacher not found" })
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateTeacherDto: UpdateTeacherDto
  ) {
    const result = await this.teacherService.updateTeacher(
      id,
      updateTeacherDto
    );
    return result;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete teacher' })
  // @Roles(RolesEnum.ADMIN, TeacherRole.TEACHER, TeacherRole.ADMIN, 'ID')
  // @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: "Teacher soft deleted successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin or Teacher access required",
  })
  @ApiResponse({ status: 404, description: "Teacher not found" })
  async remove(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() deleteTeacherDto: DeleteTeacherDto,
    @CurrentUser() user: IToken
  ) {
    const result = await this.teacherService.softDeleteTeacher(
      id,
      deleteTeacherDto.reason,
      user.id
    );
    return result;
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate/deactivate teacher for students' })
  @Roles(RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: "Teacher activation status updated successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin access required",
  })
  @ApiResponse({ status: 404, description: "Teacher not found" })
  async activate(@Param("id", ParseUUIDPipe) id: string) {
    const result = await this.teacherService.activateTeacher(id);
    return result;
  }

  @Patch(":id/rating")
  @ApiOperation({ summary: "Update teacher rating (Authenticated users)" })
  @ApiBearerAuth()
  @ApiBody({ type: UpdateRatingDto })
  @ApiResponse({
    status: 200,
    description: "Teacher rating updated successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Teacher not found" })
  async updateRating(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateRatingDto: UpdateRatingDto
  ) {
    const result = await this.teacherService.updateRating(id, updateRatingDto);
    return result;
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore deleted teacher' })
  @Roles(RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN, TeacherRole.TEACHER, TeacherRole.ADMIN, 'ID')
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: "Teacher restored successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Admin or Teacher access required",
  })
  @ApiResponse({ status: 404, description: "Teacher not found" })
  async restore(@Param("id", ParseUUIDPipe) id: string) {
    const result = await this.teacherService.restoreTeacher(id);
    return result;
  }

  @Delete(":id/hard")
  @ApiOperation({ summary: "Hard delete teacher - permanently delete" })
  // @Roles(RolesEnum.SUPER_ADMIN)
  // @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: "Teacher permanently deleted successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - SuperAdmin access required",
  })
  @ApiResponse({ status: 404, description: "Teacher not found" })
  async hardDelete(@Param("id", ParseUUIDPipe) id: string) {
    const result = await this.teacherService.hardDeleteTeacher(id);
    return result;
  }
}
