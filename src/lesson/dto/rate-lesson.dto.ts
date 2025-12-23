import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, Max, Min } from "class-validator";

export class RateLessonDto {
  @ApiProperty({ description: "Star rating 1-5", example: 5 })
  @Min(1)
  @Max(5)
  star: number;

  @ApiPropertyOptional({
    description: "Optional text feedback",
    example: "Ajoyib dars bo'ldi",
  })
  @IsOptional()
  @IsString()
  feedback?: string;
}

