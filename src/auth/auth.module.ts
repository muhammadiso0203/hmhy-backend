import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthTeacherController } from "./teacher/auth-teacher.controller";
import { AuthTeacherService } from "./teacher/auth-teacher.service";
import { TeacherModule } from "../teacher/teacher.module";
import { AuthAdminController } from "./admin/auth-admin.controller";
import { AuthAdminService } from "./admin/auth-admin.service";
import { AdminModule } from "../admin/admin.module";

@Module({
  imports: [JwtModule.register({}), TeacherModule, AdminModule],
  controllers: [AuthTeacherController, AuthAdminController],
  providers: [AuthTeacherService, AuthAdminService],
})
export class AuthModule {}
