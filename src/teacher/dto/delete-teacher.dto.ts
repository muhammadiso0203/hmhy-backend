import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class DeleteTeacherDto {
    @ApiProperty({
        example: "Leaving the company",
        description: "Reason for deleting the teacher",
    })
    @IsString()
    @IsOptional()
    reason: string;
}
