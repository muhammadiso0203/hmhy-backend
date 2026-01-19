import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SignInDtoAdmin {
  @ApiProperty({
    example: "Muhammad2",
    description: "Username",
  })
  @IsNotEmpty({ message: "Username bo'sh bo'lishi mumkin emas" })
  username: string;

  @ApiProperty({ example: "Muhammad2!", description: "Maxfiy parol" })
  @IsString()
  @IsNotEmpty({ message: "Parol bo'sh bo'lishi mumkin emas" })
  @MinLength(6, { message: "Parol kamida 6 ta belgidan iborat bo'lishi kerak" })
  password: string;
}
