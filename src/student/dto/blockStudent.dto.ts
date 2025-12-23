import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional } from "class-validator";

export class BlockStudentDto {
  @ApiProperty({
    example: "Spam message",
  })
  @IsString()
  @IsOptional()
  reason?: string;
}
