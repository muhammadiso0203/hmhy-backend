import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { LessonTemplate } from "../../lessonTemplate/entities/lessonTemplate.entity";
import { TeacherRole, TeacherSpecification } from "src/common/enum";

@Entity("teachers")
export class Teacher {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: true, nullable: true })
  password: string;

  @Column({ nullable: true, select: false })
  refreshToken: string;

  @Column({ nullable: true })
  fullName: string;

  @Column({ nullable: true })
  image: string;

  @Column({ name: "phone_number", nullable: true })
  phoneNumber: string;

  @Column({ name: "card_number", nullable: true })
  cardNumber: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isDelete: boolean;

  @Column({ type: "enum", enum: TeacherRole, default: TeacherRole.TEACHER })
  role: TeacherRole;

  @Column({ type: "enum", enum: TeacherSpecification, nullable: true })
  specification: TeacherSpecification;

  @Column({ nullable: true })
  level: string;

  @Column({ type: "text", nullable: true })
  reason?: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "int", default: 0 })
  hourPrice: number;

  @Column({ nullable: true })
  portfolioLink: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ type: "int", default: 0 })
  rating: number;

  @Column({ nullable: true })
  expirence: string;

  @OneToMany("Lesson", (lesson: any) => lesson.teacher)
  lessons: any[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => LessonTemplate, (template) => template.teacher)
  lessonTemplates: LessonTemplate[];

  @OneToMany("DeletedTeacher", (deleted: any) => deleted.teacher)
  deletedHistory: any[];

  @OneToMany("Notification", (notification: any) => notification.student)
  notifications: any[];

  @OneToMany("LessonHistory", (history: any) => history.teacher)
  lessonHistory: any[];

  @OneToMany("TeacherPayment", (payment: any) => payment.teacher)
  payments: any[];

  @Column({ nullable: true, select: false })
  otpCode: string;

  @Column({ type: "timestamp", nullable: true, select: false })
  otpExpires: Date;

  @Column({ type: "text", nullable: true })
  googleAccessToken: string | null;

  @Column({ type: "text", nullable: true })
  googleRefreshToken: string | null;
}
