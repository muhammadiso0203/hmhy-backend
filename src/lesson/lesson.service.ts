import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateLessonDto } from "./dto/create-lesson.dto";
import { UpdateLessonDto } from "./dto/update-lesson.dto";
import { Lesson } from "./entities/lesson.entity";

@Injectable()
export class LessonService {
  constructor(
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>
  ) {}

  async create(createLessonDto: CreateLessonDto) {
    const newLesson = this.lessonRepository.create(createLessonDto);
    return await this.lessonRepository.save(newLesson);
  }

  async findAll() {
    return await this.lessonRepository.find({
      relations: ["teacher", "student"],
    });
  }

  async findOne(id: string) {
    const lesson = await this.lessonRepository.findOne({
      where: { id },
      relations: ["teacher", "student"],
    });

    if (!lesson) {
      throw new NotFoundException(`Dars ID=${id} topilmadi`);
    }
    return lesson;
  }

  async update(id: string, updateLessonDto: UpdateLessonDto) {
    const lesson = await this.findOne(id);
    Object.assign(lesson, updateLessonDto);
    return await this.lessonRepository.save(lesson);
  }

  async remove(id: string) {
    const lesson = await this.findOne(id);
    await this.lessonRepository.remove(lesson);
    return { message: "Dars muvaffaqiyatli o'chirildi" };
  }
}
