import { ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { CreateNotificationDto } from "./create-notification.dto";
import { IsOptional, IsString, IsBoolean, IsDateString } from "class-validator";

export class UpdateNotificationDto extends PartialType(CreateNotificationDto) {
  @ApiPropertyOptional({
    example: "Dars vaqti o'zgardi!",
    description: "Xabarnoma matnini yangilash",
  })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({
    example: true,
    description: "Xabar yuborilganligini tasdiqlash",
  })
  @IsOptional()
  @IsBoolean()
  isSend?: boolean;

  @ApiPropertyOptional({
    description: "Yuborish vaqtini qayta belgilash",
  })
  @IsOptional()
  @IsDateString()
  sendAt?: Date;
}
