import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsDateString,
  IsInt,
  IsOptional,
  IsBoolean,
} from "class-validator";

export class CreateLessonDto {
  @ApiProperty({
    example: "Matematika darsi",
    description: "Darsning nomi",
  })
  @IsString()
  @IsNotEmpty({ message: "Dars nomi bo'sh bo'lmasligi kerak" })
  name: string;

  @ApiProperty({
    example: "2025-12-20T10:00:00Z",
    description: "Dars boshlanish vaqti",
  })
  @IsDateString()
  @IsNotEmpty()
  startTime: Date;

  @ApiProperty({
    example: "2025-12-20T11:00:00Z",
    description: "Dars tugash vaqti",
  })
  @IsDateString()
  @IsNotEmpty()
  endTime: Date;

  @ApiProperty({
    example: "uuid-o'qituvchi-id",
    description: "Dars beruvchi o'qituvchining IDsi",
  })
  @IsUUID()
  @IsNotEmpty()
  teacherId: string;

  @ApiProperty({
    example: "uuid-talaba-id",
    description: "Darsda qatnashuvchi talabaning IDsi",
  })
  studentId: string;

  @ApiProperty({
    example: 150000,
    description: "Dars narxi",
  })
  @IsInt()
  @IsNotEmpty()
  price: number;

  @ApiProperty({
    example: "https://meet.google.com/abc-defg-hij",
    description: "Google Meets havolasi",
  })
  @IsString()
  @IsOptional()
  googleMeetsUrl?: string;

  @ApiProperty({
    example: false,
    description: "Dars uchun to'lov qilinganligi holati",
  })
  @IsBoolean()
  @IsOptional()
  isPaid?: boolean;
}
