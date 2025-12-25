import { ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import {
  CreateTransactionDto,
  TransactionStatus,
} from "./create-transaction.dto";
import { IsOptional, IsString, IsEnum, IsDateString } from "class-validator";

export class UpdateTransactionDto extends PartialType(CreateTransactionDto) {
  @ApiPropertyOptional({
    example: TransactionStatus.COMPLETED,
    enum: TransactionStatus,
  })
  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @ApiPropertyOptional({
    example: "To'lov muvaffaqiyatli yakunlandi",
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({
    description: "Yangilangan to‘lov vaqti",
    example: "2025-12-25T10:30:00Z",
  })
  @IsOptional()
  @IsDateString()
  performanceTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  canceledTime?: string;
}
