export enum RolesEnum {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
}

export enum TeacherRole {
  TEACHER = "TEACHER",
  ADMIN = "ADMIN",
}

export enum TeacherSpecification {
  ENGLISH = "ENGLISH",
  RUSSIAN = "RUSSIAN",
  DEUTSCH = "DEUTSCH",
  SPANISH = "SPANISH",
  FRENCH = "FRENCH",
  ITALIAN = "ITALIAN",
  JAPANESE = "JAPANESE",
  CHINESE = "CHINESE",
  ARABIC = "ARABIC",
  KOREAN = "KOREAN",
}

export enum PaymeMethod {
  CheckPerformTransaction = "CheckPerformTransaction",
  CreateTransaction = "CreateTransaction",
  PerformTransaction = "PerformTransaction",
  CancelTransaction = "CancelTransaction",
  CheckTransaction = "CheckTransaction",
  GetStatement = "GetStatement",
}

export enum PaymeError {
  TransportError = -32300,
  AccessDeny = -32504,
  ParseError = -32700,
  MethodNotFound = -32601,
  InvalidParams = -32602,
  InternalError = -32400,
  CantDoOperation = -31008,
  TransactionNotFound = -31003,
  AlreadyDone = -31006,
  Pending = -31050,
  InvalidAmount = -31003,
  CantCancelTransaction = -31007,
  UserNotFound = -31050,
  StudentNotFound = -31050,
  OrderNotFound = -31051,
  LessonNotFound = -31001,
  LessonNotAvailable = -31051,
  StudentBlocked = -31052,
}

export enum LessonStatus {
  AVAILABLE = "available",
  BOOKED = "booked",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}
