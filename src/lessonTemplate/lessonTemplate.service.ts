import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { LessonTemplate } from "./entities/lessonTemplate.entity";
import { CreateLessonTemplateDto } from "./dto/create-lesson-template.dto";
import { UpdateLessonTemplateDto } from "./dto/update-lesson-template.dto";

@Injectable()
export class LessonTemplateService {
  constructor(
    @InjectRepository(LessonTemplate)
    private readonly lessonTemplateRepository: Repository<LessonTemplate>
  ) {}

  async create(createDto: CreateLessonTemplateDto) {
    const newTemplate = this.lessonTemplateRepository.create({
      name: createDto.name,
      timeSlot: createDto.timeSlot,
      teacher: { id: createDto.teacher } as any,
    });

    return await this.lessonTemplateRepository.save(newTemplate);
  }

  async findAll() {
    return await this.lessonTemplateRepository.find({
      relations: ["teacher"],
    });
  }

  async findOne(id: string) {
    const template = await this.lessonTemplateRepository.findOne({
      where: { id },
      relations: ["teacher"],
    });

    if (!template) {
      throw new NotFoundException(`Dars shabloni ID=${id} topilmadi`);
    }
    return template;
  }

  async findByTeacher(teacherId: string) {
    return await this.lessonTemplateRepository.find({
      where: { teacher: { id: teacherId } as any },
      relations: ["teacher"],
    });
  }

  async update(id: string, updateDto: UpdateLessonTemplateDto) {
    const template = await this.findOne(id);

    if (updateDto.teacher) {
      template.teacher = { id: updateDto.teacher } as any;
    }

    if (updateDto.name) template.name = updateDto.name;
    if (updateDto.timeSlot) template.timeSlot = updateDto.timeSlot;

    return await this.lessonTemplateRepository.save(template);
  }

  async remove(id: string) {
    const template = await this.findOne(id);

    await this.lessonTemplateRepository.remove(template);

    return { message: "Dars shabloni muvaffaqiyatli o'chirildi" };
  }
}
