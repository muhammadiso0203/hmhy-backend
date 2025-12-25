import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsString,
  IsPhoneNumber,
  IsOptional,
  IsUUID,
  IsEmail,
} from "class-validator";

export class CreateStudentDto {
  @ApiProperty({
    example: "Ali",
    description: "Talabaning ismi",
  })
  @IsString()
  @IsNotEmpty({ message: "Ism bo‘sh bo‘lmasligi kerak" })
  firstName: string;

  @ApiProperty({
    example: "Valiyev",
    description: "Talabaning familiyasi",
  })
  @IsString()
  @IsNotEmpty({ message: "Familiya bo‘sh bo‘lmasligi kerak" })
  lastName: string;

  @ApiProperty({
    example: "+998901234567",
    description: "Talabaning telefon raqami (Login uchun asosiy maydon)",
  })
  @IsPhoneNumber("UZ", { message: "Iltimos, to‘g‘ri telefon raqami kiriting" })
  @IsNotEmpty({ message: "Telefon raqami bo‘sh bo‘lmasligi kerak" })
  phoneNumber: string;

  @ApiPropertyOptional({
    example: "123456789",
    description: "Telegram ID raqami",
  })
  @IsOptional()
  @IsString()
  tgId?: string;

  @ApiPropertyOptional({
    example: "alivali_uz",
    description: "Telegram foydalanuvchi nomi",
  })
  @IsOptional()
  @IsString()
  tgUsername?: string;

  @ApiPropertyOptional({
    example: "uuid-format-id",
    description: "Dars ID raqami (agar ro'yxatdan o'tishda dars tanlasa)",
  })
  @IsOptional()
  @IsUUID()
  lesson?: string;
}
