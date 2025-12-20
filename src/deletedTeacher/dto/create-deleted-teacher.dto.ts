import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsUUID, IsOptional } from "class-validator";

export class CreateDeletedTeacherDto {
  @ApiProperty({
    example: "550e8400-e29b-41d4-a716-446655440000",
    description: "O‘chirilayotgan o‘qituvchining UUID raqami",
  })
  @IsUUID()
  @IsNotEmpty({ message: "O'qituvchi ID-si bo‘sh bo‘lmasligi kerak" })
  teacher: string;

  @ApiProperty({
    example: "550e8400-e29b-41d4-a716-446655440111",
    description: "O‘chirishni amalga oshirgan admin/foydalanuvchi UUID raqami",
  })
  @IsUUID()
  @IsNotEmpty({ message: "O'chiruvchi shaxs ID-si bo‘sh bo‘lmasligi kerak" })
  deletedBy: string;

  @ApiProperty({
    example: "Mehnat shartnomasi muddati tugadi",
    description: "O‘qituvchini o‘chirish sababi",
  })
  @IsString()
  @IsNotEmpty({ message: "O'chirish sababi ko'rsatilishi shart" })
  reason: string;
}
