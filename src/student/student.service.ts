import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Student } from "./entities/student.entity"; // Entity nomi o'zgardi
import { CreateStudentDto } from "./dto/create-student.dto";
import { UpdateStudentDto } from "./dto/update-student.dto";
import { BlockStudentDto } from "./dto/blockStudent.dto";
import { successRes } from "src/common/response/succesResponse";

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
      total,active,blocked
    }

    return successRes(data, 200)
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
    const data = student
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

  async blockStudent(id: string, blockStudentDto:BlockStudentDto) {
    const student = await this.findOne(id);

    student.isBlocked = true;
    student.blockedAt = new Date();
    student.blockedReason = blockStudentDto.reason || "Spam message";

    await this.studentRepository.save(student);

    return student;
  }
  

  async unblockStudent (id:string){
    const student = await this.findOne(id)

    if(!student.isBlocked){
      throw new BadRequestException("Student bloklanmagan")
    }

    student.isBlocked = false;
    await this.studentRepository.save(student)

    return student;
  }

  async updateRefreshToken(id: string, hashedToken: string | null) {
    return await this.studentRepository.update(id, {} as any);
  }
}
