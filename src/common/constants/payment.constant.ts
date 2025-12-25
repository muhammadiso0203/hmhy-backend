// src/common/constants/payment.constant.ts

/**
 * Currency conversion constants
 */
export const CURRENCY = {
  TIYIN_TO_SOM: 100, // 1 som = 100 tiyin
} as const;

export const JSON_RPC_VERSION = "2.0";

/**
 * Payme configuration
 */
export const PAYME_CONFIG = {
  MERCHANT_ID: process.env.PAYME_MERCHANT_ID || "",
  ENDPOINT: process.env.PAYME_ENDPOINT || "https://checkout.paycom.uz",
  KEY: process.env.PAYME_KEY || "",
  LOGIN: process.env.PAYME_LOGIN || "",
  MIN_AMOUNT: 100, // Minimum amount in tiyin
  MAX_AMOUNT: 100000000, // Maximum amount in tiyin
} as const;

/**
 * Payment providers
 */
export const PAYMENT_PROVIDERS = {
  PAYME: "PAYME",
  CLICK: "CLICK",
} as const;

/**
 * Payme cancel reasons
 */
export const PAYME_CANCEL_REASON = {
  RECEIVER_NOT_FOUND: 1, // Qabul qiluvchi topilmadi (lekin Payme da odatda ishlatilmaydi)
  USER_CANCELED: 2, // Foydalanuvchi to‘lovni bekor qildi
  SYSTEM_ERROR: 3, // Tizim xatosi
  TIMEOUT: 4, // Vaqt tugadi (12 daqiqa o‘tdi) — eng muhimi shu!
  MERCHANT_CANCELED: 5, // Savdogar (merchant) bekor qildi
  REFUND: 6, // Qaytarib berish (refund)
} as const;

export type PaymeCancelReasonCode = (typeof PAYME_CANCEL_REASON)[keyof typeof PAYME_CANCEL_REASON];

export const PAYME_CANCEL_REASON_MESSAGE: Record<PaymeCancelReasonCode, string> = {
  [PAYME_CANCEL_REASON.RECEIVER_NOT_FOUND]: "Qabul qiluvchi topilmadi",
  [PAYME_CANCEL_REASON.USER_CANCELED]: "Foydalanuvchi to‘lovni bekor qildi",
  [PAYME_CANCEL_REASON.SYSTEM_ERROR]: "Tizim xatosi yuz berdi",
  [PAYME_CANCEL_REASON.TIMEOUT]: "Tranzaksiya vaqti tugadi (12 daqiqa o‘tdi)",
  [PAYME_CANCEL_REASON.MERCHANT_CANCELED]: "Savdogar tomonidan bekor qilindi",
  [PAYME_CANCEL_REASON.REFUND]: "Mablag‘ qaytarib berildi",
};

/**
 * Transaction states
 */
export const TRANSACTION_STATES = {
  PENDING: "PENDING",
  PAID: "PAID",
  PENDING_CANCELED: "PENDING_CANCELED",
  PAID_CANCELED: "PAID_CANCELED",
} as const;

/**
 * Lesson statuses
 */
export const LESSON_STATUS = {
  AVAILABLE: "available",
  BOOKED: "booked",
  COMPLETED: "completed",
  CANCELED: "canceled",
} as const;
