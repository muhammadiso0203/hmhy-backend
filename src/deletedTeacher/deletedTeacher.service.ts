import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateDeletedTeacherDto } from "./dto/create-deleted-teacher.dto";
import { UpdateDeletedTeacherDto } from "./dto/update-deleted-teacher.dto";
import { DeletedTeacher } from "./entities/deletedTeacher.entity";

@Injectable()
export class DeletedTeachersService {
  constructor(
    @InjectRepository(DeletedTeacher)
    private readonly deletedRepo: Repository<DeletedTeacher>
  ) {}

  async create(createDto: CreateDeletedTeacherDto) {
    const newRecord = this.deletedRepo.create({
      reason: createDto.reason,
      teacher: { id: createDto.teacher } as any, 
      deletedBy: { id: createDto.deletedBy } as any, 
    });

    return await this.deletedRepo.save(newRecord);
  }

  async findAll() {
    return await this.deletedRepo.find({
      relations: ["teacher", "deletedBy"], 
      order: { deletedAt: "DESC" },
    });
  }

  async findOne(id: string) {
    const record = await this.deletedRepo.findOne({
      where: { id },
      relations: ["teacher", "deletedBy"],
    });

    if (!record) {
      throw new NotFoundException(`O'chirish qaydi (ID=${id}) topilmadi`);
    }
    return record;
  }

  async update(id: string, updateDto: UpdateDeletedTeacherDto) {
    const record = await this.findOne(id);

    if (updateDto.reason) record.reason = updateDto.reason;
    if (updateDto.restoreAt) record.restoreAt = updateDto.restoreAt;

    return await this.deletedRepo.save(record);
  }

  async remove(id: string) {
    const record = await this.findOne(id);
    await this.deletedRepo.remove(record);
    return { message: "O'chirish logi bazadan o'chirildi" };
  }
}
