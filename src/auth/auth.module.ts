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

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.register({}),
    TeacherModule,
    AdminModule,
    TypeOrmModule.forFeature([Teacher]),
    MailModule,
  ],
  controllers: [AuthTeacherController, AuthAdminController],
  providers: [AuthTeacherService, AuthAdminService, GoogleStrategy, JwtStrategy],
  exports: [AuthTeacherService, JwtStrategy, PassportModule],
})
export class AuthModule {}
