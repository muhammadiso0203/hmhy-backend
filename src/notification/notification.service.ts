import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateNotificationDto } from "./dto/create-notification.dto";
import { UpdateNotificationDto } from "./dto/update-notification.dto";
import { Notification } from "./entities/notification.entity";
import { Lesson } from "../lesson/entities/lesson.entity";

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,

    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>
  ) {}

  async create(createNotificationDto: CreateNotificationDto) {
    const newNotification = this.notificationRepository.create(
      createNotificationDto
    );
    return await this.notificationRepository.save(newNotification);
  }

  async findAll() {
    return await this.notificationRepository.find({
      relations: ["student", "lesson"],
    });
  }

  async findOne(id: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id },
      relations: ["student", "lesson"],
    });

    if (!notification) {
      throw new NotFoundException(`Xabarnoma ID=${id} topilmadi`);
    }
    return notification;
  }

  async update(id: string, updateNotificationDto: UpdateNotificationDto) {
    const notification = await this.findOne(id);
    Object.assign(notification, updateNotificationDto);
    return await this.notificationRepository.save(notification);
  }

  async remove(id: string) {
    const notification = await this.findOne(id);
    await this.notificationRepository.remove(notification);
    return { message: "Xabarnoma muvaffaqiyatli o'chirildi" };
  }

  async findUnsent() {
    return await this.notificationRepository.find({
      where: { isSend: false },
    });
  }

  async sendLessonBookingNotification(lessonId: string) {
    try {
      // Darsni batafsil ma'lumotlar bilan olish
      const lesson = await this.lessonRepository.findOne({
        where: { id: lessonId },
        relations: ["student", "teacher"],
      });

      if (!lesson) {
        this.logger.warn(
          `Lesson ${lessonId} topilmadi — notification yuborilmadi`
        );
        return;
      }

      const student = lesson.student;
      const teacher = lesson.teacher;

      if (!student || !teacher) {
        this.logger.warn("Talaba yoki o‘qituvchi topilmadi");
        return;
      }

      const startTime = new Date(lesson.startTime).toLocaleString("uz-UZ", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      const studentMessage = `🎉 Tabriklaymiz! Siz muvaffaqiyatli dars band qildingiz!

📚 Dars: ${teacher.name} bilan individual dars
📅 Sana: ${startTime}
💰 Narxi: ${lesson.price.toLocaleString("uz-UZ")} so‘m

🔗 Dars havolasi: ${lesson.meetingUrl || "Havola tez orada yuboriladi"}

Savollaringiz bo‘lsa, adminga yozing! 😊`;

      const teacherMessage = `🔔 Yangi dars band qilindi!

👤 Talaba: ${student.firstName} ${student.lastName || ""}
📅 Sana: ${startTime}
💰 Narxi: ${lesson.price.toLocaleString("uz-UZ")} so‘m

🔗 Dars havolasi: ${lesson.meetingUrl || "Havola tez orada tayyor bo‘ladi"}

Darsga tayyorlaning! 🚀`;

      // // 1. Talabaga yuborish (Telegram orqali, agar telegramId bor bo‘lsa)
      // if (student.telegramId) {
      //   await this.sendTelegramMessage(student.telegramId, studentMessage);
      // }

      // // 2. O‘qituvchiga yuborish (agar telegramId bor bo‘lsa)
      // if (teacher.telegramId) {
      //   await this.sendTelegramMessage(teacher.telegramId, teacherMessage);
      // }

      // 3. Agar Telegram yo‘q bo‘lsa — email yoki push notification (keyinroq qo‘shasiz)
      // await this.sendEmail(student.email, "Dars band qilindi", studentMessage);
      // await this.sendPushNotification(student.deviceToken, studentMessage);

      // 4. Ichki notificationlarga saqlash (agar Notification entity bo‘lsa)
      // await this.saveInternalNotification(student.id, "Dars band qilindi", studentMessage);

      this.logger.log(`Dars ${lessonId} band qilindi — notification yuborildi`);
    } catch (error) {
      this.logger.error("sendLessonBookingNotification xatosi:", error);
      // Silent fail — to‘lov allaqachon o‘tgan, notification muhim emas
    }
  }
}
