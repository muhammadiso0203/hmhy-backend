import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEmail, IsNumber, IsEnum, MinLength, IsBoolean, IsArray } from 'class-validator';

export class UpdateTeacherMeDto {
  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'Full name of the teacher',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/image.jpg',
    description: 'Image URL',
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({
    example: 0,
    description: 'Hour price',
  })
  @IsOptional()
  @IsNumber()
  hourPrice?: number;

  @ApiPropertyOptional({
    example: '+998901234567',
    description: 'Phone number',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    example: 'Advanced',
    description: 'Level',
  })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiPropertyOptional({
    example: '10 years',
    description: 'Experience',
  })
  @IsOptional()
  @IsString()
  experience?: string;

  @ApiPropertyOptional({
    example: 'Experienced teacher with 10 years of experience',
    description: 'Bio/Description',
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({
    example: 'https://portfolio.example.com/video',
    description: 'Portfolio video link',
  })
  @IsOptional()
  @IsString()
  portfolioVideoLink?: string;

  @ApiPropertyOptional({
    example: '8600123456789012',
    description: 'Card number',
  })
  @IsOptional()
  @IsString()
  cardNumber?: string;

  @ApiPropertyOptional({
    example: 'English',
    description: 'Teaching language',
  })
  @IsOptional()
  @IsString()
  teachingLanguage?: string;

  @ApiPropertyOptional({
    example: ['string'],
    description: 'Lessons',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  lessons?: string[];

}

