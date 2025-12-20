import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Teacher } from "./entities/teacher.entity";
import { successRes } from "src/common/response/succesResponse";
import { UpdateTeacherMeDto } from "./dto/updateTeacherMe.dto";
import { UpdateTeacherDto } from "./dto/update-teacher.dto";
import { UpdateRatingDto } from "./dto/updateRating.dto";

@Injectable()
export class TeacherService {
  constructor(
    @InjectRepository(Teacher)
    private readonly teacherRepo: Repository<Teacher>
  ) {}

  async findAllTeachers() {
    const teachers = await this.teacherRepo.find({
      where: { isDelete: false },
    });
    return successRes(teachers);
  }

  async findActiveTeachers() {
    const teachers = await this.teacherRepo.find({
      where: { isActive: true, isDelete: false },
    });
    return successRes(teachers);
  }

  async findDeletedTeachers() {
    const teachers = await this.teacherRepo.find({
      where: { isDelete: true },
    });
    return successRes(teachers);
  }

  async findOne(id: string) {
    const teacher = await this.teacherRepo.findOne({
      where: { id },
    });
    if (!teacher) {
      throw new NotFoundException("Teacher not found");
    }
    return successRes(teacher);
  }

  async findTeacherProfile(id: string) {
    return await this.findOne(id);
  }

  async updateTeacherProfile(id: string, dto: UpdateTeacherMeDto) {
    const teacher = await this.teacherRepo.findOne({ where: { id } });

    if (!teacher) {
      throw new NotFoundException("Teacher not found");
    }

    Object.assign(teacher, dto);

    const updatedTeacher = await this.teacherRepo.save(teacher);
    return successRes(updatedTeacher);
  }

  async updateTeacher(id: string, dto: UpdateTeacherDto) {
    const teacher = await this.teacherRepo.findOne({ where: { id } });

    if (!teacher) {
      throw new NotFoundException("Teacher not found");
    }

    Object.assign(teacher, dto);

    return await this.teacherRepo.save(teacher);
  }

  async softDeleteTeacher(id: string) {
    const teacher = await this.teacherRepo.findOne({ where: { id } });
    if (!teacher) {
      throw new NotFoundException("Teacher not found");
    }
    teacher.isDelete = true;
    await this.teacherRepo.save(teacher);
    return successRes({ message: "Teacher soft deleted successfully" });
  }

  async activateTeacher(id: string) {
    const teacher = await this.teacherRepo.findOne({ where: { id } });
    if (!teacher) {
      throw new NotFoundException("Teacher not found");
    }
    teacher.isActive = !teacher.isActive;
    const updatedTeacher = await this.teacherRepo.save(teacher);
    return successRes({
      isActive: updatedTeacher.isActive,
      message: `Teacher ${updatedTeacher.isActive ? "activated" : "deactivated"} successfully`,
    });
  }

  async updateRating(id: string, dto: UpdateRatingDto) {
    const teacher = await this.teacherRepo.findOne({ where: { id } });
    if (!teacher) {
      throw new NotFoundException("Teacher not found");
    }

    teacher.rating = dto.rating;
    const updatedTeacher = await this.teacherRepo.save(teacher);
    return successRes(updatedTeacher);
  }

  async restoreTeacher(id: string) {
    const teacher = await this.teacherRepo.findOne({ where: { id } });
    if (!teacher) {
      throw new NotFoundException("Teacher not found");
    }
    if (!teacher.isDelete) {
      throw new BadRequestException("Teacher is not deleted");
    }
    teacher.isDelete = false;
    const restoredTeacher = await this.teacherRepo.save(teacher);
    return successRes(restoredTeacher);
  }

  async hardDeleteTeacher(id: string) {
    const teacher = await this.teacherRepo.findOne({ where: { id } });
    if (!teacher) {
      throw new NotFoundException("Teacher not found");
    }
    await this.teacherRepo.remove(teacher);
    return successRes({ message: "Teacher permanently deleted" });
  }

    async findTeacherByEmail(email: string) {
    const teacher = await this.teacherRepo.findOneBy({
      email,
      isDelete: false,
    });
    if (!teacher) {
      throw new NotFoundException(`O'qituvchi ${email} topilmadi`);
    }
    return teacher;
  }

    async findOneWithRefreshToken(id: string) {
    const teacher = await this.teacherRepo.findOne({
      where: { id },
      select: ['id', 'email', 'password', 'refreshToken', 'role', 'fullName', 'phoneNumber', 'cardNumber', 'isActive', 'isDelete', 'specification', 'level', 'description', 'hourPrice', 'portfolioLink', 'imageUrl', 'rating', 'expirence', 'createdAt', 'updatedAt'],
    });
    if (!teacher) {
      throw new NotFoundException("Teacher not found");
    }
    return successRes(teacher);
  }

    async updateRefreshToken(id: string, hashedToken: string | null) {
    return await this.teacherRepo.update(id, {
      refreshToken: hashedToken ?? undefined,
    });
  }



  // async getGoogleCalendarStatus(id: string) {
  //   const teacher = await this.teacherRepo.findOne({
  //     where: { id },
  //     select: ['id', 'googleId', 'googleAccessToken', 'googleRefreshToken']
  //   });

  //   if (!teacher) {
  //     throw new NotFoundException('Teacher not found');
  //   }

  //   const isConnected = !!(teacher.googleId && teacher.googleAccessToken);

  //   return successRes({
  //     isConnected,
  //     hasGoogleId: !!teacher.googleId,
  //     hasAccessToken: !!teacher.googleAccessToken,
  //     hasRefreshToken: !!teacher.googleRefreshToken,
  //   });
  // }
}
