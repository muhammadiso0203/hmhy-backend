import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { Admin } from "./entities/admin.entity";
import { CreateAdminDto } from "./dto/create-admin.dto";
import { UpdateAdminDto } from "./dto/update-admin.dto";
import { RolesEnum } from "src/common/enum";

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>
  ) {}

  async create(createAdminDto: CreateAdminDto) {
    const { username, password } = createAdminDto;

    const existingAdmin = await this.adminRepository.findOneBy({ username });
    if (existingAdmin) {
      throw new BadRequestException("Bu username allaqachon mavjud");
    }

    const hashedPassword = await bcrypt.hash(password, 7);

    const newAdmin = this.adminRepository.create({
      username,
      password: hashedPassword,
      role: RolesEnum.ADMIN, // Faqat username/password keladi, role doim ADMIN bo'ladi
    });

    return await this.adminRepository.save(newAdmin);
  }

  async findAll() {
    return await this.adminRepository.find({
      where: { isDelete: false },
    });
  }

  async findOne(id: string) {
    const admin = await this.adminRepository.findOneBy({
      id,
      isDelete: false,
    });
    if (!admin) {
      throw new NotFoundException(`Admin ID=${id} topilmadi`);
    }
    return admin;
  }

  async findAdminByUsername(username: string) {
    return await this.adminRepository.findOne({
      where: { username, isDelete: false },
      select: ["id", "username", "password", "role", "refreshToken"],
    });
  }

  async update(id: string, updateAdminDto: UpdateAdminDto) {
    const admin = await this.findOne(id);

    if (updateAdminDto.password) {
      updateAdminDto.password = await bcrypt.hash(updateAdminDto.password, 7);
    }

    Object.assign(admin, updateAdminDto);
    return await this.adminRepository.save(admin);
  }

  async remove(id: string) {
    const admin = await this.findOne(id);
    admin.isDelete = true;
    await this.adminRepository.save(admin);
    return { message: "Admin o'chirildi" };
  }

  async updateRefreshToken(id: string, hashedToken: string | null) {
    return await this.adminRepository.update(id, {
      refreshToken: hashedToken ?? undefined,
    });
  }

  async getProfile(id: string) {
    const admin = await this.adminRepository.findOne({ where: { id } });
    if (!admin) throw new NotFoundException("Admin topilmadi");
    return admin;
  }

  async updateProfile(id: string, updateDto: UpdateAdminDto) {
    const admin = await this.getProfile(id);

    if (updateDto.password) {
      if (updateDto.password !== updateDto.confirmPassword) {
        throw new BadRequestException("Parollar bir-biriga mos kelmadi");
      }
      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash(updateDto.password, salt);
    }

    const { password, confirmPassword, ...otherData } = updateDto;
    Object.assign(admin, otherData);

    return await this.adminRepository.save(admin);
  }
}
