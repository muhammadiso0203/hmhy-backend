import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TeacherModule } from "./teacher/teacher.module";
import { Teacher } from "./teacher/entities/teacher.entity";
import { AuthModule } from "./auth/auth.module";
import { AdminModule } from "./admin/admin.module";
import { StudentModule } from "./student/student.module";
import { LessonTemplateModule } from "./lessonTemplate/lessonTemplate.module";
import { DeletedTeacher } from "./deletedTeacher/entities/deletedTeacher.entity";
import { LessonModule } from "./lesson/lesson.module";
import { NotificationModule } from "./notification/notification.module";
import { LessonHistoryModule } from "./lessonHistory/lessonHistory.module";
import { TransactionModule } from "./transaction/transaction.module";
import { TeacherPaymentModule } from "./teacherPayment/teacherPayment.module";
import { PaymentModule } from "./payment/payment.module";

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: ".env", isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get<string>("PG_HOST"),
        port: configService.get<number>("PG_PORT"),
        username: configService.get<string>("PG_USER"),
        password: configService.get<string>("PG_PASSWORD"),
        database: configService.get<string>("PG_DB"),
        entities: [Teacher, DeletedTeacher],
        synchronize: true,
        autoLoadEntities: true,
        logging: false,
      }),
    }),
    DeletedTeacher,
    AuthModule,
    TeacherModule,
    AdminModule,
    StudentModule,
    LessonTemplateModule,
    LessonModule,
    NotificationModule,
    LessonHistoryModule,
    TransactionModule,
    TeacherPaymentModule,
    PaymentModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
