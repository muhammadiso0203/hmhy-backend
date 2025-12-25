import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Transaction State for filtering
 */
export enum TransactionStateFilter {
  ALL = 'ALL',
  PENDING = 'PENDING',
  PAID = 'PAID',
  PENDING_CANCELED = 'PENDING_CANCELED',
  PAID_CANCELED = 'PAID_CANCELED',
}

/**
 * Payment Provider for filtering
 */
export enum PaymentProviderFilter {
  ALL = 'ALL',
  PAYME = 'PAYME',
  CLICK = 'CLICK',
}

/**
 * Sort field options
 */
export enum TransactionSortField {
  CREATED_AT = 'createdAt',
  AMOUNT = 'amount',
  STATE = 'state',
  CREATE_TIME = 'createTime',
  PERFORM_TIME = 'performTime',
}

/**
 * Sort direction
 */
export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

/**
 * Filter DTO for admin transaction list
 */
export class AdminTransactionFilterDto {
  // Pagination
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;

  // Filters
  @IsOptional()
  @IsEnum(TransactionStateFilter)
  state?: TransactionStateFilter = TransactionStateFilter.ALL;

  @IsOptional()
  @IsEnum(PaymentProviderFilter)
  provider?: PaymentProviderFilter = PaymentProviderFilter.ALL;

  @IsOptional()
  @IsString()
  studentId?: string;

  @IsOptional()
  @IsString()
  lessonId?: string;

  @IsOptional()
  @IsString()
  teacherId?: string;

  @IsOptional()
  @IsString()
  search?: string; // Search by student name, teacher name, or transaction ID

  @IsOptional()
  @IsDateString()
  startDate?: string; // Filter by creation date

  @IsOptional()
  @IsDateString()
  endDate?: string;

  // Sorting
  @IsOptional()
  @IsEnum(TransactionSortField)
  sortBy?: TransactionSortField = TransactionSortField.CREATED_AT;

  @IsOptional()
  @IsEnum(SortDirection)
  sortDirection?: SortDirection = SortDirection.DESC;
}

/**
 * Transaction response DTO for admin
 */
export class AdminTransactionResponseDto {
  id: string;
  paymeId?: string;
  clickId?: string;
  provider: string;
  amount: number;
  state: string;
  createTime: string;
  performTime?: string;
  cancelTime?: string;
  reason?: number;

  // Relations
  lesson: {
    id: string;
    startTime: string;
    endTime: string;
    price: number;
    teacher: {
      id: string;
      name: string;
      email: string;
    };
  };

  student: {
    id: string;
    firstname?: string;
    lastname?: string;
    phone: string;
    telegramId: string;
  };

  createdAt: string;
  updatedAt: string;
}

/**
 * Paginated transaction response
 */
export class PaginatedTransactionResponseDto {
  data: AdminTransactionResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  summary: {
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    canceledAmount: number;
    totalTransactions: number;
    paidTransactions: number;
    pendingTransactions: number;
    canceledTransactions: number;
  };
}
