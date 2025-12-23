import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';

import { AdminService } from '../admin/admin.service';
import { TeacherService } from '../teacher/teacher.service';
import { StudentsService } from '../student/student.service';
import { LessonService } from '../lesson/lesson.service';
import { LessonTemplateService } from '../lessonTemplate/lessonTemplate.service';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  try {
    const adminService = app.get(AdminService);
    const teacherService = app.get(TeacherService);
    const studentsService = app.get(StudentsService);
    const lessonService = app.get(LessonService);
    const lessonTemplateService = app.get(LessonTemplateService);

    console.log('Seeding started...');

    // Create a normal admin (username must be unique)
    try {
      await adminService.create({ username: 'admin1', password: 'Admin123!' });
      console.log('Admin created: admin1');
    } catch (err: any) {
      console.log('Admin not created (maybe already exists):', err.message || err);
    }

    // Create teacher
    const teacherEmail = 'teacher1@example.com';
    let teacher: any;
    try {
      const existing = await teacherService.findTeacherByEmail(teacherEmail);
      if (existing) {
        teacher = existing;
        console.log('Teacher already exists:', teacherEmail);
      }
    } catch (err) {
      // ignore
    }
    if (!teacher) {
      teacher = await teacherService.create({
        email: teacherEmail,
        password: 'Teacher123!',
        fullName: 'Teacher One',
        phoneNumber: '+998901112233',
      });
      console.log('Teacher created:', teacherEmail);
    }

    // Create student
    const studentPhone = '+998901223344';
    let student: any;
    try {
      student = await studentsService.findByPhone(studentPhone);
      console.log('Student already exists:', studentPhone);
    } catch (err) {
      student = await studentsService.create({
        firstName: 'Ali',
        lastName: 'Valiyev',
        phoneNumber: studentPhone,
      });
      console.log('Student created:', studentPhone);
    }

    // Create a lesson between teacher and student
    try {
      const lesson = await lessonService.create({
        name: 'Math - Intro',
        startTime: new Date(Date.now() + 1000 * 60 * 60),
        endTime: new Date(Date.now() + 1000 * 60 * 120),
        teacherId: teacher.id,
        studentId: student.id,
        price: 100000,
        googleMeetsUrl: '',
        isPaid: false,
      });
      console.log('Lesson created:', lesson.id || lesson.name);
    } catch (err: any) {
      console.log('Lesson not created:', err.message || err);
    }

    // Create lesson templates for the teacher
    try {
      const templates = [
        {
          name: 'Weekday Morning Template',
          teacher: teacher.id,
          timeSlot: ['09:00-10:30', '11:00-12:30'],
        },
        {
          name: 'Weekend Intensive',
          teacher: teacher.id,
          timeSlot: ['10:00-12:00'],
        },
      ];

      const existingTemplates = await lessonTemplateService.findByTeacher(teacher.id);
      const existingNames = new Set(existingTemplates.map((et: any) => et.name));

      for (const t of templates) {
        if (existingNames.has(t.name)) {
          console.log('Lesson template already exists, skipping:', t.name);
          continue;
        }

        try {
          await lessonTemplateService.create(t);
          console.log('Lesson template created:', t.name);
        } catch (err: any) {
          console.log('Template not created (maybe invalid data):', err.message || err);
        }
      }
    } catch (err: any) {
      console.log('Lesson templates not created:', err.message || err);
    }

    console.log('Seeding finished.');
  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await app.close();
    process.exit(0);
  }
}

seed();
