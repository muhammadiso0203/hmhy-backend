import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MoreThanOrEqual, Not, IsNull, Repository } from "typeorm";
import { CreateLessonDto } from "./dto/create-lesson.dto";
import { LessonStatus, UpdateLessonDto } from "./dto/update-lesson.dto";
import { Lesson } from "./entities/lesson.entity";
import { LessonFilterDto } from "./dto/lesson-filter.dto";
import { DateRangeQueryDto } from "./dto/date-range-query.dto";
import { BookLessonDto } from "./dto/book-lesson.dto";
import { RateLessonDto } from "./dto/rate-lesson.dto";
import { LessonHistory } from "../lessonHistory/entities/lessonHistory.entity";

@Injectable()
export class LessonService {
  constructor(
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    @InjectRepository(LessonHistory)
    private readonly lessonHistoryRepository: Repository<LessonHistory>
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

  async findAllAdmin(filters: LessonFilterDto) {
    const qb = this.lessonRepository
      .createQueryBuilder("lesson")
      .leftJoinAndSelect("lesson.teacher", "teacher")
      .leftJoinAndSelect("lesson.student", "student")
      .orderBy("lesson.startTime", "DESC");

    if (filters.teacherId) {
      qb.andWhere("lesson.teacherId = :teacherId", {
        teacherId: filters.teacherId,
      });
    }

    if (filters.studentId) {
      qb.andWhere("lesson.studentId = :studentId", {
        studentId: filters.studentId,
      });
    }

    if (filters.status) {
      qb.andWhere("lesson.status = :status", { status: filters.status });
    }

    if (filters.isPaid !== undefined) {
      qb.andWhere("lesson.isPaid = :isPaid", { isPaid: filters.isPaid });
    }

    if (filters.from) {
      qb.andWhere("lesson.startTime >= :from", { from: filters.from });
    }

    if (filters.to) {
      qb.andWhere("lesson.endTime <= :to", { to: filters.to });
    }

    return qb.getMany();
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

  async findByTeacherAdmin(teacherId: string, filters?: LessonFilterDto) {
    return this.findAllAdmin({ ...filters, teacherId });
  }

  async findMyLessons(teacherId: string) {
    return this.lessonRepository.find({
      where: { teacherId },
      order: { startTime: "DESC" },
    });
  }

  async findMyBookedLessons(teacherId: string) {
    return this.lessonRepository.find({
      where: { teacherId, bookedAt: Not(IsNull()) },
      order: { bookedAt: "DESC" },
    });
  }

  async findMyByDateRange(teacherId: string, { from, to }: DateRangeQueryDto) {
    const qb = this.lessonRepository
      .createQueryBuilder("lesson")
      .where("lesson.teacherId = :teacherId", { teacherId })
      .orderBy("lesson.startTime", "ASC");

    if (from) {
      qb.andWhere("lesson.startTime >= :from", { from });
    }
    if (to) {
      qb.andWhere("lesson.endTime <= :to", { to });
    }

    return qb.getMany();
  }

  async completeLesson(id: string, teacherId?: string) {
    const lesson = await this.findOne(id);
    if (teacherId && lesson.teacherId !== teacherId) {
      throw new ForbiddenException("Siz faqat o'z darslaringizni yakunlay olasiz");
    }

    lesson.status = LessonStatus.COMPLETED;
    lesson.completedAt = new Date();
    return this.lessonRepository.save(lesson);
  }

  async rateLesson(id: string, dto: RateLessonDto) {
    const lesson = await this.findOne(id);

    const history = this.lessonHistoryRepository.create({
      lessonId: lesson.id,
      teacherId: lesson.teacherId,
      studentId: lesson.studentId,
      star: dto.star,
      feedback: dto.feedback,
    });

    return this.lessonHistoryRepository.save(history);
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
