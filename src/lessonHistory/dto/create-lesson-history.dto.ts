import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsEnum,
  IsOptional,
} from "class-validator";

export enum StarRating {
  ONE = 1,
  TWO = 2,
  THREE = 3,
  FOUR = 4,
  FIVE = 5,
}

export class CreateLessonHistoryDto {
  @ApiProperty({
    example: "uuid-lesson-id",
    description: "Tugallangan darsning ID-si",
  })
  @IsUUID()
  @IsNotEmpty()
  lessonId: string;

  @ApiProperty({
    example: "uuid-teacher-id",
    description: "O'qituvchining ID-si",
  })
  @IsUUID()
  @IsNotEmpty()
  teacherId: string;

  @ApiProperty({
    example: "uuid-student-id",
    description: "Talabaning ID-si",
  })
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({
    example: 5,
    enum: StarRating,
    description: "Dars uchun qo'yilgan yulduzcha (baho)",
  })
  @IsEnum(StarRating)
  @IsNotEmpty()
  star: StarRating;

  @ApiProperty({
    example: "Dars juda qiziqarli o'tdi, rahmat!",
    description: "Dars haqida fikr-mulohaza",
  })
  @IsString()
  @IsOptional()
  feedback?: string;
}
