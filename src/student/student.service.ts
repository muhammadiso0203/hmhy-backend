import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LessThanOrEqual, Repository } from "typeorm";
import { Student } from "./entities/student.entity"; // Entity nomi o'zgardi
import { CreateStudentDto } from "./dto/create-student.dto";
import { UpdateStudentDto } from "./dto/update-student.dto";
import { BlockStudentDto } from "./dto/blockStudent.dto";
import { successRes } from "src/common/response/succesResponse";
import { Lesson } from "../lesson/entities/lesson.entity";
import { LessonStatus } from "../common/enum";

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,

    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>
  ) {}

  async create(createStudentDto: CreateStudentDto) {
    const newStudent = this.studentRepository.create(createStudentDto as any);
    return await this.studentRepository.save(newStudent);
  }

  async findAll(page: number = 1, limit: number = 10) {
    const [students, total] = await this.studentRepository.findAndCount({
      where: { isBlocked: false },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: students,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async stats() {
    const allStudents = await this.studentRepository.find();

    const total = allStudents.length;
    const active = allStudents.filter((s) => !s.isBlocked).length;
    const blocked = allStudents.filter((s) => s.isBlocked).length;

    const data = {
      total,
      active,
      blocked,
    };

    return successRes(data, 200);
  }

  async findOne(id: string) {
    const student = await this.studentRepository.findOneBy({ id });

    if (!student) {
      throw new NotFoundException(`Talaba ID=${id} topilmadi`);
    }
    return student;
  }

  async findByPhone(phoneNumber: string) {
    const student = await this.studentRepository.findOneBy({ phoneNumber });
    if (!student) {
      throw new NotFoundException(
        `Telefon raqami ${phoneNumber} bo'lgan talaba topilmadi`
      );
    }
    const data = student;
    return successRes(data, 200);
  }

  async update(id: string, updateStudentDto: UpdateStudentDto) {
    const student = await this.findOne(id);

    Object.assign(student, updateStudentDto);

    return await this.studentRepository.save(student);
  }

  async remove(id: string) {
    const student = await this.findOne(id);

    student.isBlocked = true;
    student.blockedAt = new Date();
    student.blockedReason = "Admin tomonidan o'chirildi (Bloklandi)";

    await this.studentRepository.save(student);
    return { message: "Talaba muvaffaqiyatli bloklandi (Soft-delete)" };
  }

  async blockStudent(id: string, blockStudentDto: BlockStudentDto) {
    const student = await this.findOne(id);

    student.isBlocked = true;
    student.blockedAt = new Date();
    student.blockedReason = blockStudentDto.reason || "Spam message";

    await this.studentRepository.save(student);

    return student;
  }

  async unblockStudent(id: string) {
    const student = await this.findOne(id);

    if (!student.isBlocked) {
      throw new BadRequestException("Student bloklanmagan");
    }

    student.isBlocked = false;
    await this.studentRepository.save(student);

    return student;
  }

  async updateRefreshToken(id: string, hashedToken: string | null) {
    return await this.studentRepository.update(id, {} as any); // bilmiman
  }

  async getLessonsByChatId(chatId: string) {
    console.log("Qidirilayotgan ChatId:", chatId);
    const now = new Date();

    const studentWithLessons = await this.studentRepository
      .createQueryBuilder("student")
      .leftJoinAndSelect(
        "student.lesson",
        "lesson",
        "lesson.startTime > :now",
        { now }
      )
      .where("student.chatId = :chatId", { chatId })
      .orderBy("lesson.startTime", "ASC")
      .getOne();

    if (!studentWithLessons) {
      console.log("Bunday chatId li student topilmadi!");
      return null;
    }

    return studentWithLessons.lesson || [];
  }

  async getLessonHistory(chatId: string) {
    const student = await this.studentRepository.findOne({ where: { chatId } });
    if (!student) return null;

    const now = new Date();

    return await this.lessonRepository.find({
      where: {
        student: { id: student.id },
        startTime: LessThanOrEqual(now),
      },
      order: { startTime: "DESC" },
    });
  }

  // src/student/student.service.ts

  async getStudentProfileById(id: string) {
    const now = new Date();

    const student = await this.studentRepository.findOne({
      where: { id },
      relations: ["lesson"],
    });

    if (!student) return null;

    const upcomingCount = student.lesson.filter(
      (l) => new Date(l.startTime) > now
    ).length;

    const pastCount = student.lesson.filter(
      (l) => new Date(l.startTime) <= now
    ).length;

    return {
      fullName: `${student.firstName} ${student.lastName || ""}`.trim(),
      chatId: student.chatId,
      phone: student.phoneNumber,
      upcomingCount,
      pastCount,
      isActive: !student.isBlocked,
    };
  }

  async findByPhoneNumber(phoneNumber: string): Promise<Student | null> {
    return await this.studentRepository.findOne({ where: { phoneNumber } });
  }

  async findOneWithRefreshToken(id: string) {
    const student = await this.studentRepository
      .createQueryBuilder("student")
      .where("student.id = :id", { id })
      .addSelect("student.refreshToken") 
      .getOne();

    return { data: student };
  }
}
