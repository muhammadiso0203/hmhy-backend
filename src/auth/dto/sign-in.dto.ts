import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignInDto {
  @ApiProperty({ example: 'user@example.com', description: 'Elektron pochta manzili' })
  @IsEmail({}, { message: "Email formati noto'g'ri" })
  @IsNotEmpty({ message: "Email bo'sh bo'lishi mumkin emas" })
  email: string;

  @ApiProperty({ example: 'password123', description: 'Maxfiy parol' })
  @IsString()
  @IsNotEmpty({ message: "Parol bo'sh bo'lishi mumkin emas" })
  @MinLength(6, { message: "Parol kamida 6 ta belgidan iborat bo'lishi kerak" })
  password: string;
}