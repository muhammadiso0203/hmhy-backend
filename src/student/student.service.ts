import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Student } from "./entities/student.entity"; // Entity nomi o'zgardi
import { CreateStudentDto } from "./dto/create-student.dto";
import { UpdateStudentDto } from "./dto/update-student.dto";

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>
  ) {}

  async create(createStudentDto: CreateStudentDto) {
    const newStudent = this.studentRepository.create(createStudentDto as any);
    return await this.studentRepository.save(newStudent);
  }

  async findAll() {
    return await this.studentRepository.find({
      where: { isBlocked: false },
    });
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
    return student;
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

  async updateRefreshToken(id: string, hashedToken: string | null) {
    return await this.studentRepository.update(id, {
    } as any);
  }
}
