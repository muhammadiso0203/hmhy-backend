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
import { CreateNotificationDto } from "./dto/create-notification.dto";
import { UpdateNotificationDto } from "./dto/update-notification.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { AdminGuard } from "../common/guards/admin.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { NotificationService } from "./notification.service";

@ApiTags("notifications")
@Controller("notifications")
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationController {
  constructor(private readonly notificationsService: NotificationService) {}

  @Roles("admin") 
  @ApiOperation({ summary: "Yangi xabarnoma yaratish" })
  @ApiResponse({
    status: 201,
    description: "Xabarnoma muvaffaqiyatli yaratildi",
  })
  @Post()
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @Roles("admin")
  @ApiOperation({ summary: "Barcha xabarnomalarni ko'rish" })
  @Get()
  findAll() {
    return this.notificationsService.findAll();
  }

  @Roles("admin", "student") 
  @ApiOperation({ summary: "ID bo'yicha xabarnomani olish" })
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.notificationsService.findOne(id);
  }

  @Roles("admin")
  @ApiOperation({ summary: "Xabarnomani yangilash" })
  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateNotificationDto: UpdateNotificationDto
  ) {
    return this.notificationsService.update(id, updateNotificationDto);
  }

  @Roles("admin")
  @ApiOperation({ summary: "Xabarnomani o'chirish" })
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.notificationsService.remove(id);
  }
}
