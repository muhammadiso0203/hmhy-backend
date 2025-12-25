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
  CheckPerformTransaction = "CheckPerformTransaction", // To'lovni amalga oshirish mumkinligini tekshirish
  CreateTransaction = "CreateTransaction", // Tranzaksiya yaratish
  PerformTransaction = "PerformTransaction", // To'lovni o'tkazish (yopish)
  CancelTransaction = "CancelTransaction", // Tranzaksiyani bekor qilish
  CheckTransaction = "CheckTransaction", // Tranzaksiya holatini tekshirish
  GetStatement = "GetStatement", // Ma'lum bir davr uchun hisobotlarni olish
}

export enum PaymeError {
  // Tizimli xatoliklar (JSON-RPC standart)
  TransportError = -32300, // Transport xatoligi
  AccessDeny = -32504, // Kirishga ruxsat yo'q (Secret key noto'g'ri)
  ParseError = -32700, // JSONni o'qishda xatolik
  MethodNotFound = -32601, // So'ralgan metod topilmadi
  InvalidParams = -32602, // Kirish parametrlarida xatolik
  InternalError = -32400, // Server ichki xatosi

  // Tranzaksiyaga oid xatoliklar
  CantDoOperation = -31008, // Operatsiyani bajarib bo'lmaydi
  TransactionNotFound = -31003, // Tranzaksiya topilmadi
  AlreadyDone = -31006, // Tranzaksiya allaqachon bajarilgan
  Pending = -31050, // Tranzaksiya kutilmoqda (foydalanuvchi band)
  InvalidAmount = -31003, // To'lov summasi noto'g'ri
  CantCancelTransaction = -31007, // Tranzaksiyani bekor qilib bo'lmaydi

  // Biznes mantiq xatoliklari (Sizning tizimingizga oid)
  UserNotFound = -31050, // Foydalanuvchi topilmadi
  StudentNotFound = -31050, // Student topilmadi
  OrderNotFound = -31051, // Buyurtma topilmadi
  LessonNotFound = -31001, // Dars topilmadi
  LessonNotAvailable = -31051, // Dars mavjud emas (band yoki bekor qilingan)
  StudentBlocked = -31052, // Student bloklangan
}
