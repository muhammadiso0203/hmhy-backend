import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from "@nestjs/common";
import {
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CreateAdminDto } from "./dto/create-admin.dto";
import { UpdateAdminDto } from "./dto/update-admin.dto";
import { AdminService } from "./admin.service";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { RolesEnum } from "src/common/enum";
import { successRes } from "../common/response/succesResponse";

@ApiTags("Admin")
// @ApiBearerAuth("access-token")
// @UseGuards(JwtAuthGuard, RolesGuard)
@Controller("admin")
export class AdminController {
  constructor(private readonly adminsService: AdminService) { }

  @Get("me")
  @Roles(RolesEnum.ADMIN, RolesEnum.SUPER_ADMIN)
  @ApiOperation({ summary: "Get current admin profile" })
  @ApiResponse({ status: 200, description: "Profil muvaffaqiyatli olindi" })
  async getProfile(@Request() req) {
    const profile = await this.adminsService.getProfile(req.user.id);
    return profile;
  }

  @Patch("me")
  @ApiOperation({ summary: "Update own profile" })
  @ApiResponse({ status: 200, description: "Profil muvaffaqiyatli yangilandi" })
  async updateProfile(@Request() req, @Body() updateDto: UpdateAdminDto) {
    const updated = await this.adminsService.updateProfile(req.user.id, updateDto);
    return updated;
  }

  @Roles(RolesEnum.SUPER_ADMIN)
  @Post()
  @ApiOperation({ summary: "Create new admin (only super admin)" })
  @ApiResponse({
    status: 201,
    description: "Yangi admin muvaffaqiyatli yaratildi",
  })
  create(@Body() createAdminDto: CreateAdminDto) {
    const newAdmin = this.adminsService.create(createAdminDto);
    return newAdmin;
  }

  @Roles(RolesEnum.SUPER_ADMIN, RolesEnum.ADMIN)
  @Get(["statistics"])
  @ApiOperation({ summary: "Get system statistics" })
  @ApiResponse({
    status: 200,
    description: "Statistika muvaffaqiyatli olindi",
  })
  getStatistics() {
    const statistic = this.adminsService.getStatistics().then((data) => data);
    return statistic;
  }

  @Roles(RolesEnum.SUPER_ADMIN, RolesEnum.ADMIN)
  @Get()
  @ApiOperation({ summary: "Get all admins" })
  @ApiResponse({
    status: 200,
    description: "Adminlar ro'yxati muvaffaqiyatli olindi",
  })
  findAll() {
    const admins = this.adminsService.findAll();
    return admins;
  }

  @Roles(RolesEnum.SUPER_ADMIN, RolesEnum.ADMIN)
  @Get(":id")
  @ApiOperation({ summary: "Get admin by ID" })
  @ApiResponse({ status: 200, description: "Admin muvaffaqiyatli topildi" })
  findOne(@Param("id", new ParseUUIDPipe()) id: string) {
    const admin = this.adminsService.findOne(id);
    return admin;
  }

  @Roles(RolesEnum.SUPER_ADMIN)
  @Patch(":id")
  @ApiOperation({ summary: "Update admin by ID (only super admin)" })
  @ApiResponse({ status: 200, description: "Admin muvaffaqiyatli yangilandi" })
  update(@Param("id", new ParseUUIDPipe()) id: string, @Body() updateAdminDto: UpdateAdminDto) {
    const updated = this.adminsService.update(id, updateAdminDto);
    return updated;
  }

  @Roles(RolesEnum.SUPER_ADMIN)
  @Delete(":id")
  @ApiOperation({ summary: "Delete admin by ID (only super admin)" })
  @ApiResponse({ status: 200, description: "Admin muvaffaqiyatli o'chirildi" })
  remove(@Param("id", new ParseUUIDPipe()) id: string) {
    const result = this.adminsService.remove(id);
    return result;
  }
}
