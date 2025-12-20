import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsDateString,
  IsBoolean,
  IsOptional,
} from "class-validator";

export class CreateNotificationDto {
  @ApiProperty({
    example: "uuid-talaba-id",
    description: "Xabarnoma yuborilishi kerak bo'lgan talaba IDsi",
  })
  @IsUUID()
  @IsNotEmpty({ message: "Student ID bo'sh bo'lmasligi kerak" })
  studentId: string;

  @ApiProperty({
    example: "uuid-lesson-id",
    description: "Xabarnoma qaysi darsga tegishli ekanligi",
  })
  @IsUUID()
  @IsNotEmpty({ message: "Lesson ID bo'sh bo'lmasligi kerak" })
  lesson: string;

  @ApiProperty({
    example: "Darsingiz 15 daqiqadan so'ng boshlanadi",
    description: "Xabarnoma matni",
  })
  @IsString()
  @IsNotEmpty({ message: "Xabar matni bo'sh bo'lmasligi kerak" })
  message: string;

  @ApiProperty({
    example: "2025-12-20T10:00:00Z",
    description: "Xabarnoma yuborilishi kerak bo'lgan vaqt",
  })
  @IsDateString()
  @IsNotEmpty()
  sendAt: Date;

  @ApiProperty({
    example: false,
    description: "Xabarnoma yuborilganligi holati",
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isSend?: boolean;
}
