import { ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import {
  CreateLessonHistoryDto,
  StarRating,
} from "./create-lesson-history.dto";
import { IsOptional, IsString, IsEnum } from "class-validator";

export class UpdateLessonHistoryDto extends PartialType(
  CreateLessonHistoryDto
) {
  @ApiPropertyOptional({
    example: 4,
    enum: StarRating,
  })
  @IsOptional()
  @IsEnum(StarRating)
  star?: StarRating;

  @ApiPropertyOptional({
    example: "Dars yaxshi o'tdi, lekin audio sifati pastroq edi.",
  })
  @IsOptional()
  @IsString()
  feedback?: string;
}
