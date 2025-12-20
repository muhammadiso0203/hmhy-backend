import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsArray,
  ArrayNotEmpty,
} from "class-validator";

export class CreateLessonTemplateDto {
  @ApiProperty({
    example: "Matematika darsi",
    description: "Dars shablonining nomi",
  })
  @IsString()
  @IsNotEmpty({ message: "Dars nomi bo‘sh bo‘lmasligi kerak" })
  name: string;

  @ApiProperty({
    example: "550e8400-e29b-41d4-a716-446655440000",
    description: "Darsni o'tuvchi o'qituvchi ID raqami (UUID)",
  })
  @IsUUID()
  @IsNotEmpty({ message: "O'qituvchi ID raqami kiritilishi shart" })
  teacher: string;

  @ApiProperty({
    example: ["09:00-10:30", "11:00-12:30"],
    description: "Dars vaqtlari ro'yxati (massiv ko'rinishida)",
    type: [String],
  })
  @IsArray({ message: "Vaqtlar ro'yxati massiv formatida bo'lishi kerak" })
  @ArrayNotEmpty({ message: "Kamida bitta dars vaqti kiritilishi lozim" })
  @IsString({ each: true, message: "Har bir vaqt formati matn bo'lishi kerak" })
  timeSlot: string[];
}
