import {
  IsString,
  IsNumber,
  IsNotEmpty,
  ValidateNested,
  IsOptional,
  Equals,
} from 'class-validator';
import { Type } from 'class-transformer';
import { JSON_RPC_VERSION } from 'src/common/constants/payment.constant';

/**
 * Payme Account DTO
 */
export class PaymeAccountDto {
  @IsString()
  @IsNotEmpty()
  lesson_id: string;

  @IsString()
  @IsNotEmpty()
  student_id: string;
}

/**
 * Payme Request Params DTO
 */
export class PaymeParamsDto {
  @ValidateNested()
  @Type(() => PaymeAccountDto)
  @IsOptional()
  account?: PaymeAccountDto;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  id?: string;

  @IsNumber()
  @IsOptional()
  time?: number;

  @IsNumber()
  @IsOptional()
  reason?: number;

  @IsNumber()
  @IsOptional()
  from?: number;

  @IsNumber()
  @IsOptional()
  to?: number;
}

/**
 * Payme Request DTO
 */
export class PaymeRequestDto {
  @IsString()
  @Equals(JSON_RPC_VERSION)
  jsonrpc: string;

  @IsString()
  @IsNotEmpty()
  method: string;

  @ValidateNested()
  @Type(() => PaymeParamsDto)
  params: PaymeParamsDto;

  @IsOptional()
  id?: string | number;
}

