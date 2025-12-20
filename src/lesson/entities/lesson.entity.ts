import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { Student } from "../../student/entities/student.entity";

export enum LessonStatus {
  SCHEDULED = "scheduled",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

@Entity("lesson")
export class Lesson {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ type: "timestamp" })
  startTime: Date;

  @Column({ type: "timestamp" })
  endTime: Date;

  @Column({ nullable: true })
  googleMeetsUrl: string;

  @Column({ type: "enum", enum: LessonStatus, default: LessonStatus.SCHEDULED })
  status: LessonStatus;

  @Column({ nullable: true })
  googleEventId: string;

  @Column({ type: "int" })
  price: number;

  @Column({ default: false })
  isPaid: boolean;

  @Column({ type: "uuid" })
  teacherId: string;

  @Column({ type: "uuid" })
  studentId: string;

  @Column({ type: "uuid", nullable: true })
  teacherPayment: string;

  @Column({ type: "timestamp", nullable: true })
  bookedAt: Date;

  @Column({ type: "timestamp", nullable: true })
  remainedSendAt: Date;

  @Column({ type: "timestamp", nullable: true })
  completedAt: Date;

  @Column({ type: "uuid", nullable: true })
  notification: string;

  @Column({ type: "uuid", nullable: true })
  transaction: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne("Teacher", (teacher: any) => teacher.lessons)
  teacher: any;

  @ManyToOne(() => Student, (student) => student.lesson)
  @JoinColumn({ name: "studentId" })
  student: Student;

  @OneToMany("Notification", (notification: any) => notification.lesson)
  notifications: any[];
}
