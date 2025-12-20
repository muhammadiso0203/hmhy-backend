import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("notification")
export class Notification {
  @PrimaryGeneratedColumn("uuid") 
  id: string;

  @Column({ type: "uuid" })
  studentId: string;

  @Column({ type: "uuid" })
  lessonId: string;

  @Column({ type: "varchar" })
  message: string;

  @Column({ type: "timestamp" })
  sendAt: Date;

  @Column({ type: "boolean", default: false })
  isSend: boolean;

  @ManyToOne("Student", (student: any) => student.notifications)
  @JoinColumn({ name: "studentId" })
  student: any;

  @ManyToOne("Lesson", (lesson: any) => lesson.notifications)
  @JoinColumn({ name: "lessonId" })
  lesson: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
