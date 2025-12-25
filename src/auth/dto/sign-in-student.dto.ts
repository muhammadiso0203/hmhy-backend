import { IsNotEmpty, IsString, MinLength, Matches } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SignInDtoStudent {
  @ApiProperty({
    example: "+998901234567",
    description: "Talabaning telefon raqami",
  })
  @IsNotEmpty({ message: "Telefon raqami bo'sh bo'lishi mumkin emas" })
  @IsString()
  @Matches(/^\+998\d{9}$/, {
    message: "Telefon raqami noto'g'ri formatda (+998901234567)",
  })
  phoneNumber: string;
}
