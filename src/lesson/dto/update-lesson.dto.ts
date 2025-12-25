import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsOptional,
  IsString,
  IsEnum,
  IsBoolean,
  IsDateString,
  IsUUID,
  IsInt,
} from "class-validator";
import { LessonStatus } from "src/common/enum";


export class UpdateLessonDto {
  @ApiPropertyOptional({ example: "Matematika darsi" })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: "2025-12-25T14:00:00Z" })
  @IsOptional()
  @IsDateString()
  startTime?: Date;

  @ApiPropertyOptional({ example: "2025-12-25T15:00:00Z" })
  @IsOptional()
  @IsDateString()
  endTime?: Date;

  @ApiPropertyOptional({ example: "uuid-yangi-teacher-id" })
  @IsOptional()
  @IsUUID()
  teacherId?: string;

  @ApiPropertyOptional({ example: "uuid-yangi-student-id" })
  @IsOptional()
  @IsUUID()
  studentId?: string;

  @ApiPropertyOptional({ example: 200000 })
  @IsOptional()
  @IsInt()
  price?: number;

  @ApiPropertyOptional({ enum: LessonStatus })
  @IsOptional()
  @IsEnum(LessonStatus)
  status?: LessonStatus;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;

  @ApiPropertyOptional({ example: "https://meet.google.com/new-link" })
  @IsOptional()
  @IsString()
  googleMeetsUrl?: string;
}
