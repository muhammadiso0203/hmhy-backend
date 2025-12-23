import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsUUID,
} from "class-validator";
import { LessonStatus } from "./update-lesson.dto";

export class LessonFilterDto {
  @ApiPropertyOptional({ description: "Filter by teacher id" })
  @IsOptional()
  @IsUUID()
  teacherId?: string;

  @ApiPropertyOptional({ description: "Filter by student id" })
  @IsOptional()
  @IsUUID()
  studentId?: string;

  @ApiPropertyOptional({ enum: LessonStatus, description: "Filter by status" })
  @IsOptional()
  @IsEnum(LessonStatus)
  status?: LessonStatus;

  @ApiPropertyOptional({ description: "Only paid or unpaid lessons" })
  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;

  @ApiPropertyOptional({
    description: "Return lessons starting after or at this time",
    example: "2025-12-20T00:00:00Z",
  })
  @IsOptional()
  @IsDateString()
  from?: Date;

  @ApiPropertyOptional({
    description: "Return lessons ending before or at this time",
    example: "2025-12-31T23:59:59Z",
  })
  @IsOptional()
  @IsDateString()
  to?: Date;
}

