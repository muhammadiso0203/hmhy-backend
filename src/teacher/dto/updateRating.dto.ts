import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, Max } from 'class-validator';

export class UpdateRatingDto {
  @ApiProperty({
    example: 5,
    description: 'Rating value (1-5)',
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;
}

