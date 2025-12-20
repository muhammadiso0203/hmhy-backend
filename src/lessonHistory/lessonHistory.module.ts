import { Module } from "@nestjs/common";
import { TeachersController } from "./lessonHistory.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";
import { LessonHistory } from "./entities/lessonHistory.entity";
import { TeacherService } from "src/teacher/teacher.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([LessonHistory]),
    JwtModule.register({
      secret: process.env.ACCESS_TOKEN_KEY,
      signOptions: { expiresIn: Number(process.env.ACCESS_TOKEN_TIME) },
    }),
  ],
  controllers: [TeachersController],
  providers: [TeacherService],
  exports: [TeacherService],
})
export class TeacherModule {}
