import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsUUID, IsArray } from "class-validator";

export class UpdateLessonTemplateDto {
  @ApiPropertyOptional({
    example: "Matematika darsi (Advanced)",
    description: "Dars shablonining yangi nomi",
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: "550e8400-e29b-41d4-a716-446655440000",
    description: "Biriktirilgan o'qituvchining yangi UUID raqami",
  })
  @IsOptional()
  @IsUUID()
  teacher?: string;

  @ApiPropertyOptional({
    example: ["14:00-15:30", "16:00-17:30"],
    description: "Yangilangan dars vaqtlari ro'yxati",
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  timeSlot?: string[];
}
