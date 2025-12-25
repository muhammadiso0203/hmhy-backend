import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Lesson } from "../../lesson/entities/lesson.entity";
import { Student } from "../../student/entities/student.entity";

@Entity("transaction")
export class Transaction {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // Payme tranzaksiya ID si (Payme tomonidan beriladi)
  @Column({ type: "varchar", unique: true, nullable: true })
  paymeId: string;

  @Column({ type: "uuid" })
  lessonId: string;

  @Column({ type: "uuid" })
  studentId: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  amount: number; // price o‘rniga amount ishlatish yaxshiroq

  @Column({ type: "bigint" }) // Payme vaqtini millisekundda saqlash uchun
  createTime: bigint;

  @Column({ type: "bigint", nullable: true })
  performTime: bigint | null;

  @Column({ type: "bigint", nullable: true })
  cancelTime: bigint | null;

  @Column({ type: "varchar", nullable: true })
  reason: string | null;

  @Column({ type: "varchar" })
  provider: string; // PAYME yoki CLICK

  @Column({
    type: "varchar",
    default: "PENDING",
  })
  state: string; // "PENDING", "PAID", "PENDING_CANCELED", "PAID_CANCELED"

  // Relations
  @ManyToOne(() => Lesson, (lesson) => lesson.transactions)
  @JoinColumn({ name: "lessonId" })
  lesson: Lesson;

  @ManyToOne(() => Student, (student) => student.transactions)
  @JoinColumn({ name: "studentId" })
  student: Student;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: "varchar", nullable: true })
  clickId: string | null;

  
}
