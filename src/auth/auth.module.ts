import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthTeacherController } from "./teacher/auth-teacher.controller";
import { AuthTeacherService } from "./teacher/auth-teacher.service";
import { TeacherModule } from "../teacher/teacher.module";
import { AuthAdminController } from "./admin/auth-admin.controller";
import { AuthAdminService } from "./admin/auth-admin.service";
import { AdminModule } from "../admin/admin.module";
import { GoogleStrategy } from "./strategies/google.strategy";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Teacher } from "../teacher/entities/teacher.entity";
import { MailService } from "../mail/mail.service";
import { MailerService } from "@nestjs-modules/mailer";
import { MailModule } from "../mail/mail.module";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { AuthStudentService } from "./student/auth-student.service";
import { AuthStudentController } from "./student/auth-student.controller";
import { StudentModule } from "../student/student.module";
import { Student } from "../student/entities/student.entity";

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.register({}),
    TeacherModule,
    AdminModule,
    TypeOrmModule.forFeature([Teacher, Student]),
    MailModule,
    StudentModule,
  ],
  controllers: [
    AuthTeacherController,
    AuthAdminController,
    AuthStudentController,
  ],
  providers: [
    AuthTeacherService,
    AuthAdminService,
    GoogleStrategy,
    JwtStrategy,
    AuthStudentService,
  ],
  exports: [
    AuthTeacherService,
    JwtStrategy,
    PassportModule,
    AuthStudentService,
  ],
})
export class AuthModule {}
