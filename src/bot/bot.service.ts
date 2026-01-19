// import { Injectable } from "@nestjs/common";
// import { InjectRepository } from "@nestjs/typeorm";
// import { Repository } from "typeorm";
// import { Student } from "../student/entities/student.entity";
// import { StudentsService } from "../student/student.service";

// @Injectable()
// export class BotService {
//   constructor(
//     @InjectRepository(Student)
//     private readonly studentRepo: Repository<Student>,
//     private readonly studentsService: StudentsService
//   ) {}

//   // async handleMessage(ctx: any) {
//   //   if (!ctx.message) return;

//   //   const chatId = ctx.from.id.toString();
//   //   const text = ctx.message.text || "";

//   //   let student = await this.studentRepo.findOne({ where: { chatId } });

//   //   if (text === "/start") {
//   //     if (!student) {
//   //       student = this.studentRepo.create({ chatId, step: "FIRST_NAME" });
//   //     } else {
//   //       student.step = "FIRST_NAME";
//   //     }
//   //     await this.studentRepo.save(student);

//   //     const welcomeMsg = `👋 Assalomu alaykum!\n\n🎓 Botga xush kelibsiz. Ro'yxatdan o'tishni boshlaymiz.\n\n1️⃣ Ismingizni kiriting:`;
//   //     return await ctx.reply(welcomeMsg);
//   //   }

//   //   if (!student) return;

//   //   if (student.step !== "DONE") {
//   //     switch (student.step) {
//   //       case "FIRST_NAME":
//   //         student.firstName = text;
//   //         student.step = "LAST_NAME";
//   //         await this.studentRepo.save(student);
//   //         return await ctx.reply("2️⃣ Familiyangizni kiriting:");

//   //       case "LAST_NAME":
//   //         student.lastName = text;
//   //         student.step = "PHONE";
//   //         await this.studentRepo.save(student);
//   //         return await ctx.reply("3️⃣ Telefon raqamingizni yuboring:", {
//   //           reply_markup: {
//   //             keyboard: [
//   //               [{ text: "📞 Raqamni ulashish", request_contact: true }],
//   //             ],
//   //             resize_keyboard: true,
//   //             one_time_keyboard: true,
//   //           },
//   //         });

//   //       case "PHONE":
//   //         let phone = ctx.message.contact
//   //           ? ctx.message.contact.phone_number
//   //           : text;

//   //         if (!phone.startsWith("+")) phone = `+${phone}`;

//   //         student.phoneNumber = phone;

//   //         const updateData = {
//   //           firstName: student.firstName,
//   //           lastName: student.lastName,
//   //           phoneNumber: phone,
//   //           tgId: student.chatId,
//   //           tgUsername: ctx.from.username || "",
//   //           role: "student",
//   //           isBlocked: false,
//   //         };

//   //         try {
//   //           await this.studentsService.update(student.id, updateData);

//   //           student.step = "DONE";
//   //           await this.studentRepo.save(student);

//   //           return await ctx.reply(
//   //             `✅ Ro'yxatdan o'tdingiz! Darslaringizni ko'rish uchun /my_lessons buyrug'ini bosing.`,
//   //             { reply_markup: { remove_keyboard: true } }
//   //           );
//   //         } catch (error) {
//   //           console.error("Saqlashda xato:", error.message);
//   //           return await ctx.reply(
//   //             "❌ Ma'lumotlarni saqlashda xatolik yuz berdi. Qaytadan urinib ko'ring."
//   //           );
//   //         }
//   //     }
//   //   }

//   //   const currentStudent = await this.studentsService.findOne(student.id);
//   //   if (currentStudent?.isBlocked) {
//   //     return await ctx.reply(
//   //       `Siz bloklangansiz. Sabab: ${currentStudent.blockedReason || "Nomalum"}`
//   //     );
//   //   }

//   //   return await ctx.reply("Tushunarsiz buyruq. Yordam uchun /help yozing.");
//   // }

//   // async getHelp(ctx: any) {
//   //   const chatId = ctx.from.id.toString();
//   //   const student = await this.studentRepo.findOne({ where: { chatId } });

//   //   let helpText = `❓ <b>Botdan foydalanish bo'yicha yordam</b>\n\n`;

//   //   if (!student || student.step !== "DONE") {
//   //     helpText += `📝 <b>Siz hali ro'yxatdan o'tmagansiz.</b>\n`;
//   //     helpText += `Botdan foydalanishni boshlash uchun /start buyrug'ini bosing va ism-familiyangizni kiriting.`;
//   //   } else {
//   //     helpText += `✅ <b>Siz muvaffaqiyatli ro'yxatdan o'tgansiz.</b>\n\n`;
//   //     helpText += `<b>Mavjud buyruqlar:</b>\n`;
//   //     helpText += `👉 /start - Botni qayta ishga tushirish\n`;
//   //     helpText += `👉 /help - Yordam oynasini ko'rish\n`;
//   //     helpText += `💡 <b>Muammo yuzaga kelsa:</b> @ismoilxonovs bilan bog'laning.`;
//   //   }

//   //   return await ctx.reply(helpText, { parse_mode: "HTML" });
//   // }

//   // async showMyLessons(ctx: any) {
//   //   try {
//   //     const chatId = ctx.from.id.toString();
//   //     const lessons = await this.studentsService.getLessonsByChatId(chatId);

//   //     if (!lessons || lessons.length === 0) {
//   //       return await ctx.reply(
//   //         "📭 Sizda hali band qilingan darslar mavjud emas."
//   //       );
//   //     }

//   //     let message = "📅 <b>SIZNING DARSLARINGIZ</b>\n";
//   //     message += "━━━━━━━━━━━━━━━━━━\n\n";

//   //     lessons.forEach((lesson, index) => {
//   //       const start = new Date(lesson.startTime);
//   //       const dateStr = start.toLocaleDateString("uz-UZ", {
//   //         day: "2-digit",
//   //         month: "long",
//   //       });
//   //       const timeStr = start.toLocaleTimeString("uz-UZ", {
//   //         hour: "2-digit",
//   //         minute: "2-digit",
//   //       });

//   //       const statusEmoji = lesson.status === "completed" ? "✅" : "⏳";
//   //       const paymentStatus = lesson.isPaid ? "To'langan" : "To'lanmagan";

//   //       message += `<b>${index + 1}. 📘 ${lesson.name}</b>\n`;
//   //       message += `🗓 <b>Sana:</b> ${dateStr}\n`;
//   //       message += `⏰ <b>Vaqt:</b> ${timeStr}\n`;
//   //       message += `💰 <b>Narxi:</b> ${lesson.price.toLocaleString()} so'm\n`;
//   //       message += `💳 <b>To'lov:</b> ${paymentStatus}\n`;

//   //       if (lesson.googleMeetsUrl || lesson.meetingUrl) {
//   //         const link = lesson.googleMeetsUrl || lesson.meetingUrl;
//   //         message += `🔗 <a href="${link}">Darsga qo'shilish (Google Meet)</a>\n`;
//   //       }

//   //       message += `\n━━━━━━━━━━━━━━━━━━\n`;
//   //     });

//   //     return await ctx.reply(message, {
//   //       parse_mode: "HTML",
//   //       disable_web_page_preview: true,
//   //     });
//   //   } catch (error) {
//   //     console.error("Xabarni yuborishda xato:", error);
//   //     return await ctx.reply("❌ Ma'lumotlarni chiqarishda xatolik yuz berdi.");
//   //   }
//   // }

//   // async showLessonHistory(ctx: any) {
//   //   try {
//   //     const chatId = ctx.from.id.toString();
//   //     console.log("Service: Tarix so'ralmoqda...");

//   //     const history = await this.studentsService.getLessonHistory(chatId);
//   //     console.log("Service: Bazadan natija keldi:", history?.length);

//   //     if (!history || history.length === 0) {
//   //       return await ctx.reply("Sizda hali yakunlangan darslar mavjud emas.");
//   //     }

//   //     let message = "📑 <b>DARSLAR TARIXI</b>\n\n";
//   //     history.forEach((lesson) => {
//   //       const date = new Date(lesson.completedAt || lesson.startTime);
//   //       const dateStr = date.toLocaleDateString("uz-UZ").replace(/\//g, ".");
//   //       message += `<b>${lesson.name.toUpperCase()}</b>\n`;
//   //       message += `<code>Sana:  ${dateStr}</code>\n\n`;
//   //     });

//   //     return await ctx.reply(message, { parse_mode: "HTML" });
//   //   } catch (error) {
//   //     console.error("SERVICE XATOSI:", error);
//   //     return await ctx.reply("Tarixni yuklashda xatolik.");
//   //   }
//   // }
// }
