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

@ApiTags("Admin")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("admin")
export class AdminController {
  constructor(private readonly adminsService: AdminService) {}

  @Roles(RolesEnum.SUPER_ADMIN)
  @ApiOperation({ summary: "Yangi admin yaratish (Faqat SuperAdmin uchun)" })
  @ApiResponse({ status: 201, description: "Admin muvaffaqiyatli yaratildi" })
  @Post()
  create(@Body() createAdminDto: CreateAdminDto) {
    return this.adminsService.create(createAdminDto);
  }

  @Roles(RolesEnum.SUPER_ADMIN, RolesEnum.ADMIN)
  @ApiOperation({ summary: "Barcha adminlarni olish" })
  @ApiResponse({ status: 200, description: "Adminlar ro'yxati" })
  @Get()
  findAll() {
    return this.adminsService.findAll();
  }

  @Roles(RolesEnum.SUPER_ADMIN, RolesEnum.ADMIN)
  @ApiOperation({ summary: "ID bo'yicha bitta adminni olish" })
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.adminsService.findOne(id);
  }

  @Roles(RolesEnum.SUPER_ADMIN)
  @ApiOperation({ summary: "Admin ma'lumotlarini yangilash" })
  @Patch(":id")
  update(@Param("id") id: string, @Body() updateAdminDto: UpdateAdminDto) {
    return this.adminsService.update(id, updateAdminDto);
  }

  @Roles(RolesEnum.SUPER_ADMIN)
  @ApiOperation({ summary: "Adminni o'chirish" })
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.adminsService.remove(id);
  }

  @Get("me") 
  @ApiOperation({ summary: "Get current admin profile" })
  getProfile(@Request() req) {
    return this.adminsService.getProfile(req.user.id);
  }

  @Patch("me") 
  @ApiOperation({ summary: "Update own profile" })
  updateProfile(@Request() req, @Body() updateDto: UpdateAdminDto) {
    return this.adminsService.updateProfile(req.user.id, updateDto);
  }
}
