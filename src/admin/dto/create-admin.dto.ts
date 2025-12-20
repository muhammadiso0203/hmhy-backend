import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  MinLength,
  IsString,
  IsOptional,
} from "class-validator";

export class CreateAdminDto {
  @ApiProperty({
    example: "admin_pahlavon",
    description: "Adminning noyob foydalanuvchi nomi (username)",
  })
  @IsString({ message: "Username matn bo'lishi kerak" })
  @IsNotEmpty({ message: "Username bo'sh bo'lmasligi kerak" })
  username: string;

  @ApiProperty({
    example: "Admin@777!",
    description: "Admin uchun maxfiy parol (kamida 6 ta belgi)",
  })
  @IsString()
  @IsNotEmpty({ message: "Parol bo'sh bo'lmasligi kerak" })
  @MinLength(6, { message: "Parol kamida 6 ta belgidan iborat bo'lishi kerak" })
  password: string;

  @ApiProperty({
    example: "+998901234567",
    description: "Adminning telefon raqami",
    required: false,
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;
}
