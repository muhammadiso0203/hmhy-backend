import { Module } from "@nestjs/common";
import { TelegrafModule } from "nestjs-telegraf";
import { BotUpdate } from "./bot.update";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { BotService } from "./bot.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Student } from "../student/entities/student.entity";
import { StudentsService } from "../student/student.service";
import { Lesson } from "../lesson/entities/lesson.entity";

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const token = configService.get<string>("BOT_TOKEN");
        if (!token) {
          throw new Error("BOT_TOKEN topilmadi! .env faylingizni tekshiring.");
        }
        return {
          token: token,
        };
      },
      inject: [ConfigService],
    }),

    TypeOrmModule.forFeature([Student, Lesson]),
  ],
  providers: [BotUpdate, BotService, StudentsService],
})
export class BotModule {}
