import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";
import { DeletedTeachersController } from "src/deletedTeacher/deletedTeacher.controller";
import { LessonHistoryService } from "./lessonHistory.service";
import { LessonHistory } from "./entities/lessonHistory.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([LessonHistory]),
    JwtModule.register({
      secret: process.env.ACCESS_TOKEN_KEY,
      signOptions: { expiresIn: Number(process.env.ACCESS_TOKEN_TIME) },
    }),
  ],
  controllers: [DeletedTeachersController],
  providers: [LessonHistoryService],
  exports: [LessonHistoryService],
})
export class LessonHistoryModule {}
