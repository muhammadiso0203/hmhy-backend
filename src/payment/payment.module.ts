import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PaymentController } from "./payment.controller";
import { PaymentService } from "./payment.service";
import { LessonModule } from "../lesson/lesson.module";
import { JwtService } from "@nestjs/jwt";
import { NotificationService } from "../notification/notification.service";
import { Payment } from "./entities/payment.entitiy";
import { NotificationModule } from "../notification/notification.module";
import { Transaction } from "../transaction/entities/transaction.entity";
import { Lesson } from "../lesson/entities/lesson.entity";
import { Student } from "../student/entities/student.entity";
import { Teacher } from "../teacher/entities/teacher.entity";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, Lesson, Student, Teacher, Payment]), // Payment entitysini ham qo'shing
    LessonModule,
    NotificationModule,
    AuthModule, // Shu import orqali JwtStrategy va PassportModule yetib keladi
  ],
  controllers: [PaymentController],
  providers: [PaymentService], // JwtService bu yerdan olib tashlandi!
  exports: [PaymentService],
})
export class PaymentModule {}
