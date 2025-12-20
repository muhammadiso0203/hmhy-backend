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
import {
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { UserRole } from "./entities/admin.entity";
import { CreateAdminDto } from "./dto/create-admin.dto";
import { UpdateAdminDto } from "./dto/update-admin.dto";
import { AdminService } from "./admin.service";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";

@ApiTags("Admin")
@ApiBearerAuth() 
@UseGuards(JwtAuthGuard, RolesGuard) 
@Controller("admin")
export class AdminController {
  constructor(private readonly adminsService: AdminService) {}

  @Roles(UserRole.SUPERADMIN) 
  @ApiOperation({ summary: "Yangi admin yaratish (Faqat SuperAdmin uchun)" })
  @ApiResponse({ status: 201, description: "Admin muvaffaqiyatli yaratildi" })
  @Post()
  create(@Body() createAdminDto: CreateAdminDto) {
    return this.adminsService.create(createAdminDto);
  }

  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: "Barcha adminlarni olish" })
  @ApiResponse({ status: 200, description: "Adminlar ro'yxati" })
  @Get()
  findAll() {
    return this.adminsService.findAll();
  }

  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: "ID bo'yicha bitta adminni olish" })
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.adminsService.findOne(id);
  }

  @Roles(UserRole.SUPERADMIN) 
  @ApiOperation({ summary: "Admin ma'lumotlarini yangilash" })
  @Patch(":id")
  update(@Param("id") id: string, @Body() updateAdminDto: UpdateAdminDto) {
    return this.adminsService.update(id, updateAdminDto);
  }

  @Roles(UserRole.SUPERADMIN)
  @ApiOperation({ summary: "Adminni o'chirish" })
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.adminsService.remove(id);
  }
}
