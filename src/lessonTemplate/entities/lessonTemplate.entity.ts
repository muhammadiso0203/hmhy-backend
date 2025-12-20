import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Teacher } from "../../teacher/entities/teacher.entity";

@Entity("lessonTemplate")
export class LessonTemplate {
  @PrimaryGeneratedColumn("uuid") 
  id: string;

  @Column({ type: "varchar" })
  name: string;

  @Column("varchar", { array: true })
  timeSlot: string[];

  @ManyToOne(() => Teacher, (teacher) => teacher.lessonTemplates, {
    onDelete: "CASCADE",
  })
  teacher: Teacher;
}