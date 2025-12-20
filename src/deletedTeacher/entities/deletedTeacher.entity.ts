// deletedTeacher.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";

@Entity("deletedTeacher")
export class DeletedTeacher {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // Klass nomi o'rniga 'Teacher' stringini ishlating
  @ManyToOne('Teacher', (teacher: any) => teacher.deletedHistory, { onDelete: "CASCADE" })
  @JoinColumn({ name: "teacher" })
  teacher: any;

  // Klass nomi o'rniga 'Admin' stringini ishlating
  @ManyToOne('Admin', (admin: any) => admin.deletedTeachers, { onDelete: "SET NULL" })
  @JoinColumn({ name: "deletedBy" })
  deletedBy: any;

  @Column({ type: "varchar", nullable: true })
  reason: string;

  @CreateDateColumn({ type: "timestamp" })
  deletedAt: Date;

  @Column({ type: "timestamp", nullable: true })
  restoreAt: Date;
}