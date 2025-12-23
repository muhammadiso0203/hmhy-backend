import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsOptional } from "class-validator";

export class DateRangeQueryDto {
  @ApiPropertyOptional({
    description: "Start date (inclusive)",
    example: "2025-12-20T00:00:00Z",
  })
  @IsOptional()
  @IsDateString()
  from?: Date;

  @ApiPropertyOptional({
    description: "End date (inclusive)",
    example: "2025-12-31T23:59:59Z",
  })
  @IsOptional()
  @IsDateString()
  to?: Date;
}

