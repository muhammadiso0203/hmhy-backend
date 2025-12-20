import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateTeacherDto } from "./dto/create-lesson-history.dto";
import { UpdateTeacherDto } from "./dto/update-lesson-history.dto";
import * as bcrypt from "bcrypt";
import { Teacher } from "./entities/lessonHistory.entity";

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>
  ) {}

  async create(createTeacherDto: CreateTeacherDto) {
    const { password } = createTeacherDto;
    const hashed_password = await bcrypt.hash(password, 7);

    const newTeacher = this.teacherRepository.create({
      ...createTeacherDto,
      password: hashed_password,
    });

    return await this.teacherRepository.save(newTeacher);
  }

  async findAll() {
    return await this.teacherRepository.find({
      where: { isDelete: false },
    });
  }

  async findOne(id: string) {
    const teacher = await this.teacherRepository.findOneBy({
      id,
      isDelete: false,
    });
    if (!teacher) {
      throw new NotFoundException(`O'qituvchi ID=${id} topilmadi`);
    }
    return teacher;
  }

  async findTeacherByEmail(email: string) {
    const teacher = await this.teacherRepository.findOneBy({
      email,
      isDelete: false,
    });
    if (!teacher) {
      throw new NotFoundException(`O'qituvchi ${email} topilmadi`);
    }
    return teacher;
  }

  async update(id: string, updateTeacherDto: UpdateTeacherDto) {
    const teacher = await this.findOne(id);
    Object.assign(teacher, updateTeacherDto);
    return await this.teacherRepository.save(teacher);
  }

  async remove(id: string) {
    const teacher = await this.findOne(id);
    teacher.isDelete = true;
    await this.teacherRepository.save(teacher);
    return { message: "Teacher soft-deleted successfully" };
  }

  async updateRefreshToken(id: string, hashedToken: string | null) {
    return await this.teacherRepository.update(id, {
      refreshToken: hashedToken ?? undefined,
    });
  }
}
