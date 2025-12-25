import { Update, Start, On, Ctx, Help, Command } from "nestjs-telegraf";
import { BotService } from "./bot.service";

@Update()
export class BotUpdate {
  constructor(private readonly botService: BotService) {}

  @Start()
  async onStart(@Ctx() ctx: any) {
    await this.botService.handleMessage(ctx);
  }

  @Help()
  async onHelp(@Ctx() ctx: any) {
    await this.botService.getHelp(ctx);
  }

  @Command("lessons")
  async onMyLessons(@Ctx() ctx: any) {
    await this.botService.showMyLessons(ctx);
  }

  @Command("lesson_history")
  async onHistory(@Ctx() ctx: any) {
    console.log("LOG: Lesson history buyrug'i keldi!");
    await this.botService.showLessonHistory(ctx);
  }
  
  @On("text")
  async onMessage(@Ctx() ctx: any) {
    const text = ctx.message.text;

    if (text.startsWith("/")) return;

    await this.botService.handleMessage(ctx);
  }

  @On("contact")
  async onContact(@Ctx() ctx: any) {
    await this.botService.handleMessage(ctx);
  }
}
