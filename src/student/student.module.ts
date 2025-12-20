import { Module } from "@nestjs/common";
import { StudentsController } from "./student.controller";
import { StudentsService } from "./student.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";
import { Student } from "./entities/student.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Student]),
    JwtModule.register({
      secret: process.env.ACCESS_TOKEN_KEY,
      signOptions: { expiresIn: Number(process.env.ACCESS_TOKEN_TIME) },
    }),
  ],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService],
})
export class StudentModule {}
