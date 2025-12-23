import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";
import { Lesson } from "./entities/lesson.entity";
import { LessonController } from "./lesson.controller";
import { LessonService } from "./lesson.service";
import { LessonHistory } from "../lessonHistory/entities/lessonHistory.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Lesson, LessonHistory]),
    JwtModule.register({
      secret: process.env.ACCESS_TOKEN_KEY,
      signOptions: { expiresIn: Number(process.env.ACCESS_TOKEN_TIME) },
    }),
  ],
  controllers: [LessonController],
  providers: [LessonService],
  exports: [LessonService],
})
export class LessonModule {}
