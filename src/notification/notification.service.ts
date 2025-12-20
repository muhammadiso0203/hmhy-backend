import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateNotificationDto } from "./dto/create-notification.dto";
import { UpdateNotificationDto } from "./dto/update-notification.dto";
import { Notification } from "./entities/notification.entity";

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>
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
}
