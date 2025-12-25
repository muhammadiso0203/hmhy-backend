import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Student } from "./entities/student.entity";
import { Lesson } from "../lesson/entities/lesson.entity";
import { StudentsService } from "./student.service";
import { StudentsController } from "./student.controller";
import { JwtService } from "@nestjs/jwt";

@Module({
  imports: [TypeOrmModule.forFeature([Student, Lesson])],
  controllers: [StudentsController],
  providers: [StudentsService, JwtService],
  exports: [StudentsService],
})
export class StudentModule {}
