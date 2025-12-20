import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { DeletedTeacher } from "../../deletedTeacher/entities/deletedTeacher.entity";
import { RolesEnum } from "src/common/enum";


@Entity("admin")
export class Admin {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ select: false })
  password: string;

  @Column({ nullable: true, select: false })
  refreshToken: string;

  @Column({ nullable: true })
  fullName: string;

  @Column({ name: "phone_number", nullable: true })
  phoneNumber: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isDelete: boolean;

  @Column({ type: "enum", enum: RolesEnum, default: RolesEnum.ADMIN })
  role: RolesEnum;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => DeletedTeacher, (deleted) => deleted.deletedBy)
  deletedTeacher: DeletedTeacher[];
}
