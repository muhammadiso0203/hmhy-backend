import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsUUID } from "class-validator";

export class UpdateDeletedTeacherDto {
  @ApiPropertyOptional({
    example: "550e8400-e29b-41d4-a716-446655440000",
    description: "O‘chirilgan o‘qituvchining UUID raqami",
  })
  @IsOptional()
  @IsUUID()
  teacher?: string;

  @ApiPropertyOptional({
    example: "550e8400-e29b-41d4-a716-446655440111",
    description: "O‘chirishni amalga oshirgan shaxs ID-si",
  })
  @IsOptional()
  @IsUUID()
  deletedBy?: string;

  @ApiPropertyOptional({
    example: "Shartnoma muddati tugashi munosabati bilan",
    description: "O'chirish sababi",
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({
    example: "2024-03-20T10:00:00Z",
    description: "Qayta tiklash sanasi (agar tiklangan bo'lsa)",
  })
  @IsOptional()
  @IsString() 
  restoreAt?: Date;
}
