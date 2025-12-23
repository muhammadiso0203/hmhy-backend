import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";

export class BookLessonDto {
  @ApiProperty({ description: "Teacher id", example: "uuid-teacher-id" })
  @IsUUID()
  @IsNotEmpty()
  teacherId: string;

  @ApiProperty({ description: "Student id", example: "uuid-student-id" })
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({
    description: "Lesson name/subject",
    example: "Matematika darsi",
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: "Lesson start time",
    example: "2025-12-20T10:00:00Z",
  })
  @IsDateString()
  @IsNotEmpty()
  startTime: Date;

  @ApiProperty({
    description: "Lesson end time",
    example: "2025-12-20T11:00:00Z",
  })
  @IsDateString()
  @IsNotEmpty()
  endTime: Date;

  @ApiProperty({ description: "Lesson price", example: 150000 })
  @IsNotEmpty()
  @IsInt()
  price: number;

  @ApiPropertyOptional({
    description: "Google Meet link",
    example: "https://meet.google.com/abc-defg-hij",
  })
  @IsOptional()
  @IsString()
  googleMeetsUrl?: string;
}

