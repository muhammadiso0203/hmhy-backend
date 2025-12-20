import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEmail,
  IsOptional,
  IsString,
  IsNumber,
  IsUrl,
  IsPhoneNumber,
  Min,
} from "class-validator";

export class UpdateTeacherDto {
  @ApiPropertyOptional({ example: "Ali Valiyev" })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ example: "+998901234567" })
  @IsOptional()
  @IsPhoneNumber()
  phoneNumber?: string;

  @ApiPropertyOptional({ example: "8600123456789012" })
  @IsOptional()
  @IsString()
  cardNumber?: string;

  @ApiPropertyOptional({ example: "Senior" })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiPropertyOptional({ description: "O‘zingiz haqingizda ma’lumot" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 50000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  hourPrice?: number;

  @ApiPropertyOptional({ example: "https://portfolio.uz/ustoz" })
  @IsOptional()
  @IsUrl()
  portfolioLink?: string;

  @ApiPropertyOptional({ example: "5 years" })
  @IsOptional()
  @IsString()
  expirence?: string;

  @ApiPropertyOptional({ example: "https://image.com/my-photo.png" })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}
