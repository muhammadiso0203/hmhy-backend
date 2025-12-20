import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Lesson } from "../../lesson/entities/lesson.entity";

export enum StudentRole {
  STUDENT = "student",
  USER = "user",
}

@Entity("student")
export class Student {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ unique: true, nullable: true })
  phoneNumber: string;

  @Column({
    type: "enum",
    enum: StudentRole,
    default: StudentRole.STUDENT,
  })
  role: StudentRole;

  @Column({ nullable: true })
  tgId: string;

  @Column({ nullable: true })
  tgUsername: string;

  @Column({ type: "boolean", default: false })
  isBlocked: boolean;

  @Column({ type: "timestamp", nullable: true })
  blockedAt: Date;

  @Column({ nullable: true })
  blockedReason: string;

  @OneToMany(() => Lesson, (lesson) => lesson.student)
  lesson: Lesson[];

  @Column({ type: "uuid", nullable: true })
  lessonHistory: string;

  @Column({ type: "uuid", nullable: true })
  notification: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
