import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsUUID,
  IsNumber,
  IsPositive,
  IsEnum,
  IsOptional,
  IsString,
  IsDateString,
} from "class-validator";

export enum TransactionStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  CANCELED = "canceled",
}

export class CreateTransactionDto {
  @ApiProperty({
    description: "Dars ID (UUID)",
    example: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  })
  @IsUUID("4")
  @IsNotEmpty()
  lessonId: string;

  @ApiProperty({
    description: "Talaba ID (UUID)",
    example: "a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8",
  })
  @IsUUID("4")
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({
    description: "To'lov summasi (so'mda)",
    example: 150000,
  })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  price: number;

  @ApiProperty({
    description: "Tranzaksiya holati",
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  @IsEnum(TransactionStatus)
  @IsOptional()
  status?: TransactionStatus = TransactionStatus.PENDING;

  @ApiPropertyOptional({
    description: "Bekor qilish sababi",
    example: "Foydalanuvchi rad etdi",
  })
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiPropertyOptional({
    description: "To'lov amalga oshirilgan vaqt",
    example: "2025-12-25T10:30:00Z",
  })
  @IsDateString()
  @IsOptional()
  performanceTime?: string; // ← "performace" emas, "performance" + string

  @ApiPropertyOptional({
    description: "Bekor qilingan vaqt",
    example: "2025-12-25T11:00:00Z",
  })
  @IsDateString()
  @IsOptional()
  canceledTime?: string; // string
}
