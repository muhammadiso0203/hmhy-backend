import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, MinLength, IsString } from "class-validator";

export class CreateTeacherDto {
  @ApiProperty({
    example: "ustoz@example.com",
    description: "O‘qituvchining elektron pochta manzili",
  })
  @IsEmail({}, { message: "Iltimos, to‘g‘ri email kiriting" })
  @IsNotEmpty({ message: "Email bo‘sh bo‘lmasligi kerak" })
  email: string;

  @ApiProperty({
    example: "Parol123!",
    description: "O‘qituvchi uchun maxfiy parol (kamida 6 ta belgi)",
  })
  @IsString()
  @IsNotEmpty({ message: "Parol bo‘sh bo‘lmasligi kerak" })
  @MinLength(6, { message: "Parol kamida 6 ta belgidan iborat bo‘lishi kerak" })
  password: string;
}
