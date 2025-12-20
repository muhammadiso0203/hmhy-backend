import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("lesson_history")
export class LessonHistory {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  lessonId: string;

  @Column({ type: "uuid" })
  teacherId: string;

  @Column({ type: "uuid" })
  studentId: string;

  @Column({ type: "enum", enum: [1, 2, 3, 4, 5] })
  star: number;

  @Column({ type: "varchar", nullable: true })
  feedback: string;

  @ManyToOne("Lesson", (lesson: any) => lesson.history)
  @JoinColumn({ name: "lessonId" })
  lesson: any;

  @ManyToOne("Teacher", (teacher: any) => teacher.lessonHistory)
  @JoinColumn({ name: "teacherId" })
  teacher: any;

  @ManyToOne("Student", (student: any) => student.lessonHistory)
  @JoinColumn({ name: "studentId" })
  student: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
