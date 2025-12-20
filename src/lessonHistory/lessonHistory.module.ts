import { Module } from "@nestjs/common";
import { TeachersController } from "./lessonHistory.controller";
import { TeachersService } from "./lessonHistory.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Teacher } from "./entities/lessonHistory.entity";
import { JwtModule } from "@nestjs/jwt";

@Module({
  imports: [
    TypeOrmModule.forFeature([Teacher]),
    JwtModule.register({
      secret: process.env.ACCESS_TOKEN_KEY,
      signOptions: { expiresIn: Number(process.env.ACCESS_TOKEN_TIME) },
    }),
  ],
  controllers: [TeachersController],
  providers: [TeachersService],
  exports: [TeachersService],
})
export class TeacherModule {}
