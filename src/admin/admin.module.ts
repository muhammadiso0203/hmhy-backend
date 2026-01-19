import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { Admin } from "./entities/admin.entity";
import { JwtModule } from "@nestjs/jwt";
import { CryptoService } from "src/common/crypto/cryptoService";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";

import { Teacher } from "../teacher/entities/teacher.entity";
import { Student } from "../student/entities/student.entity";
import { Lesson } from "../lesson/entities/lesson.entity";
import { Transaction } from "../transaction/entities/transaction.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin, Teacher, Student, Lesson, Transaction]),
    JwtModule.register({
      secret: process.env.ACCESS_TOKEN_KEY,
      signOptions: { expiresIn: "24h" },
    }),
  ],
  controllers: [AdminController],
  providers: [AdminService, CryptoService, JwtAuthGuard, RolesGuard],
  exports: [AdminService],
})
export class AdminModule { }
