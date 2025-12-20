import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MinLength } from "class-validator";

export class UpdateAdminDto {
  @ApiPropertyOptional({
    example: "admin_pahlavon",
    description: "Adminning foydalanuvchi nomi",
  })
  @IsOptional()
  @IsString({ message: "Username matn bo'lishi kerak" })
  username?: string;

  @ApiPropertyOptional({
    example: "NewPass123!",
    description: "Yangi parol (agar o'zgartirmoqchi bo'lsa)",
  })
  @IsOptional()
  @IsString()
  @MinLength(6, { message: "Parol kamida 6 ta belgidan iborat bo'lishi kerak" })
  password?: string;

  @ApiPropertyOptional({
    example: "+998901234567",
    description: "Adminning telefon raqami",
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;
}
