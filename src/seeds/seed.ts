import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';

import { AdminService } from '../admin/admin.service';
import { TeacherService } from '../teacher/teacher.service';
import { StudentsService } from '../student/student.service';
import { LessonService } from '../lesson/lesson.service';
import { LessonTemplateService } from '../lessonTemplate/lessonTemplate.service';
import { TeacherPaymentService } from '../teacherPayment/teacherPayment.service';
import { TransactionService } from '../transaction/transaction.service';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const adminService = app.get(AdminService);
    const teacherService = app.get(TeacherService);
    const studentsService = app.get(StudentsService);
    const lessonService = app.get(LessonService);
    const lessonTemplateService = app.get(LessonTemplateService);
    const teacherPaymentService = app.get(TeacherPaymentService);
    const transactionService = app.get(TransactionService);

    console.log('Seeding started...');

    // ================= ADMIN =================
    let adminId = '';
    try {
      const admin = await adminService.create({
        username: 'admin1',
        password: 'Admin123!',
      });
      console.log('Admin created: admin1');
      adminId = admin.id;
    } catch (err: any) {
      console.log('Admin not created (maybe already exists)');
      const res: any = await adminService.findAll();
      if (res?.data?.[0]) adminId = res.data[0].id;
    }

    // ================= TEACHERS (5 ta) =================
    const teachers: any[] = [];

    for (let i = 1; i <= 10; i++) {
      const teacherEmail = `teacher${i}@example.com`;
      let teacher: any;

      try {
        const existing = await teacherService.findTeacherByEmail(teacherEmail);
        if (existing) {
          teacher = existing;
          console.log('Teacher already exists:', teacherEmail);
        }
      } catch { }

      if (!teacher) {
        teacher = await teacherService.create({
          email: teacherEmail,
          password: 'Teacher123!',
          fullName: `Teacher ${i}`,
          phoneNumber: `+99890111${200 + i}`,
        });
        console.log('Teacher created:', teacherEmail);
      }

      if (teacher) teachers.push(teacher);
    }

    // ================= DELETED TEACHERS (5 ta) =================
    for (let i = 1; i <= 10; i++) {
      const email = `deleted${i}@example.com`;
      let deletedTeacher: any;

      try {
        deletedTeacher = await teacherService.findTeacherByEmail(email);
        if (deletedTeacher) {
          console.log('Deleted teacher already exists:', email);
          continue;
        }
      } catch { }

      if (!deletedTeacher) {
        try {
          deletedTeacher = await teacherService.create({
            email,
            password: 'Teacher123!',
            fullName: `Deleted Teacher ${i}`,
            phoneNumber: `+99890999${500 + i}`,
          });

          await teacherService.softDeleteTeacher(
            deletedTeacher.id,
            'Violation of terms',
            adminId || '00000000-0000-0000-0000-000000000000'
          );

          console.log('Deleted teacher created:', email);
        } catch (err: any) {
          console.log('Deleted teacher not created:', email, err.message || err);
        }
      }
    }

    // ================= STUDENTS (5 ta) =================
    const students: any[] = [];

    for (let i = 1; i <= 10; i++) {
      const phone = `+9989012234${40 + i}`;
      let student: any;

      try {
        student = await studentsService.findByPhone(phone);
        console.log('Student already exists:', phone);
      } catch {
        student = await studentsService.create({
          firstName: `Ali${i}`,
          lastName: 'Valiyev',
          phoneNumber: phone,
        });
        console.log('Student created:', phone);
      }

      if (student) students.push(student);
    }

    // ================= LESSONS (5 ta) =================
    const createdLessons: any[] = [];
    for (let i = 0; i < 10; i++) {
      try {
        const lesson = await lessonService.create({
          name: `Math - Intro ${i + 1}`,
          startTime: new Date(Date.now() + 1000 * 60 * 60 * (i + 1)),
          endTime: new Date(Date.now() + 1000 * 60 * 120 * (i + 1)),
          teacherId: teachers[i % teachers.length].id,
          studentId: students[i % students.length].id,
          price: 100000,
          googleMeetsUrl: '',
          isPaid: false,
        });
        console.log('Lesson created:', lesson.id || lesson.name);
        createdLessons.push(lesson);
      } catch (err: any) {
        console.log('Lesson not created:', err.message || err);
      }
    }

    // ================= TEACHER PAYMENTS (5 ta) =================

    for (let i = 0; i < 5 && teachers.length > 0; i++) {
      try {
        const totalAmount = 500000 + (i * 100000); // 500k, 600k, 700k, 800k, 900k
        const commission = 10; // 10% platforma komissiyasi
        const platformAmount = Math.floor((totalAmount * commission) / 100);
        const teacherAmount = totalAmount - platformAmount;

        // Har bir to'lov uchun 2-3 ta dars tanlash
        const lessonCount = 2 + (i % 2); // 2 yoki 3 ta dars
        const selectedLessons = createdLessons
          .slice(i * 2, i * 2 + lessonCount)
          .map((lesson: any) => lesson.id);

        const payment = await teacherPaymentService.create({
          teacher: teachers[0].id, // Birinchi o'qituvchiga barcha to'lovlar
          lessons: selectedLessons,
          totalLessonAmount: totalAmount,
          platformComission: commission,
          platformAmount: platformAmount,
          teacherAmount: teacherAmount,
          paidBy: adminId,
          notes: `Oylik to'lov ${i + 1}`,
        });
        console.log('Teacher payment created:', payment.id);
      } catch (err: any) {
        console.log('Teacher payment not created:', err.message || err);
      }
    }

    // ================= LESSON TEMPLATES (har teacher uchun) =================
    for (const teacher of teachers) {
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

        const existingTemplates =
          await lessonTemplateService.findByTeacher(teacher.id);
        const existingNames = new Set(
          existingTemplates.map((et: any) => et.name)
        );

        for (const t of templates) {
          if (existingNames.has(t.name)) {
            console.log('Lesson template already exists, skipping:', t.name);
            continue;
          }

          await lessonTemplateService.create(t);
          console.log('Lesson template created:', t.name);
        }
      } catch (err: any) {
        console.log('Template error:', err.message || err);
      }
    }

    // ================= TRANSACTIONS =================
    console.log('Starting transactions seeding...');
    console.log(
      'createdLessons:',
      createdLessons ? createdLessons.length : 'null',
      'students:',
      students ? students.length : 'null'
    );

    if (createdLessons && createdLessons.length > 0 && students && students.length > 0) {
      try {
        for (let i = 0; i < Math.min(3, createdLessons.length); i++) {
          try {
            const lesson = createdLessons[i];
            const student = students[i % students.length];

            console.log(
              `Creating transaction ${i + 1}: lesson=${lesson.id}, student=${student.id}`
            );

            const transaction = await transactionService.create({
              lessonId: lesson.id,
              studentId: student.id,
              amount: 150000 + (i * 10000),
              provider: 'PAYME',
              createTime: BigInt(Date.now()),
              state: i === 0 ? 'PAID' : 'PENDING',
              performTime: i === 0 ? BigInt(Date.now()) : null,
            } as any);
            console.log('✅ Transaction created:', transaction.id);
          } catch (err: any) {
            console.log(
              '❌ Individual transaction error:',
              err.message || err
            );
          }
        }
        await transactionService.create({
          lessonId: createdLessons[0].id,
          studentId: students[0].id,
          amount: 120000,
          provider: 'PAYME',
          createTime: BigInt(Date.now()),
          state: 'PAID',
          performTime: BigInt(Date.now()),
        } as any);
        console.log('✅ Extra Fake Transaction created');
      } catch (err: any) {
        console.log('❌ Transaction batch error:', err.message || err);
      }
    } else {
      console.log(
        '⚠️ Skipping transactions: lessons=',
        createdLessons?.length || 0,
        'students=',
        students?.length || 0
      );
    }

    console.log('Seeding finished.');
  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    // ⚠️ Telegraf error bo'lmasligi uchun
    process.exit(0);
  }
}

seed();
