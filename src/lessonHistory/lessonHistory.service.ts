import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateLessonHistoryDto } from "./dto/create-lesson-history.dto";
import { UpdateLessonHistoryDto } from "./dto/update-lesson-history.dto";
import { LessonHistory } from "./entities/lessonHistory.entity";

@Injectable()
export class LessonHistoryService {
  constructor(
    @InjectRepository(LessonHistory)
    private readonly lessonHistoryRepository: Repository<LessonHistory>
  ) {}

  async create(createDto: CreateLessonHistoryDto) {
    const newHistory = this.lessonHistoryRepository.create(createDto);
    return await this.lessonHistoryRepository.save(newHistory);
  }

  async findAll() {
    return await this.lessonHistoryRepository.find({
      relations: ["lesson", "teacher", "student"],
    });
  }

  async findOne(id: string) {
    const history = await this.lessonHistoryRepository.findOne({
      where: { id },
      relations: ["lesson", "teacher", "student"],
    });

    if (!history) {
      throw new NotFoundException(`Dars tarixi ID=${id} topilmadi`);
    }

    return history;
  }

  async update(id: string, updateDto: UpdateLessonHistoryDto) {
    const history = await this.findOne(id);
    Object.assign(history, updateDto);
    return await this.lessonHistoryRepository.save(history);
  }

  async remove(id: string) {
    const history = await this.findOne(id);
    await this.lessonHistoryRepository.remove(history);
    return { message: "Dars tarixi muvaffaqiyatli o'chirildi" };
  }
}
