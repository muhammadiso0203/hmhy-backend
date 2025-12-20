import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsOptional,
  IsString,
  IsPhoneNumber,
  IsBoolean,
  IsUUID,
} from "class-validator";

export class UpdateStudentDto {
  @ApiPropertyOptional({ example: "Valiyev" })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ example: "Ali" })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: "+998901234567" })
  @IsOptional()
  @IsPhoneNumber()
  phoneNumber?: string;

  @ApiPropertyOptional({ example: "STUDENT" })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({ example: "12345678" })
  @IsOptional()
  @IsString()
  tgId?: string;

  @ApiPropertyOptional({ example: "alivali_uz" })
  @IsOptional()
  @IsString()
  tgUsername?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isBlocked?: boolean;

  @ApiPropertyOptional({ example: "Qoidalarni buzganligi uchun" })
  @IsOptional()
  @IsString()
  blockedReason?: string;

  @ApiPropertyOptional({ example: "uuid-format-id" })
  @IsOptional()
  @IsUUID()
  lesson?: string;

  @ApiPropertyOptional({ example: "uuid-format-id" })
  @IsOptional()
  @IsUUID()
  lessonHistory?: string;

  @ApiPropertyOptional({ example: "uuid-format-id" })
  @IsOptional()
  @IsUUID()
  notification?: string;
}
