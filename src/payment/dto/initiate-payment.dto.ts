/**
 * DTO for initiating payment from frontend
 */
export class InitiatePaymentDto {
  lessonId: string;
  studentId: string;
}

/**
 * Response DTO for payment initiation
 */
export class PaymentInitiationResponseDto {
  paymentUrl: string;
  transactionId: string;
  amount: number; // in tiyin
}

