import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Notification } from "./entities/notification.entity";
import { JwtModule } from "@nestjs/jwt";
import { NotificationController } from "./notification.controller";
import { NotificationService } from "./notification.service";
import { Lesson } from "../lesson/entities/lesson.entity";
import { LessonModule } from "../lesson/lesson.module";
import { Student } from "../student/entities/student.entity";
import { Teacher } from "../teacher/entities/teacher.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, Lesson, Student, Teacher]),
    JwtModule.register({
      secret: process.env.ACCESS_TOKEN_KEY,
      signOptions: { expiresIn: Number(process.env.ACCESS_TOKEN_TIME) },
    }),
    LessonModule,
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
