import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";
import { LessonTemplate } from "./entities/lessonTemplate.entity";
import { LessonTemplateController } from "./lessonTemplate.controller";
import { LessonTemplateService } from "./lessonTemplate.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([LessonTemplate]),
    JwtModule.register({
      secret: process.env.ACCESS_TOKEN_KEY,
      signOptions: { expiresIn: Number(process.env.ACCESS_TOKEN_TIME) },
    }),
  ],
  controllers: [LessonTemplateController],
  providers: [LessonTemplateService],
  exports: [LessonTemplateService],
})
export class LessonTemplateModule {}
