import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TeacherService } from './teacher.service';
import { TeacherController } from './teacher.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Teacher } from './entities/teacher.entity';
import { DeletedTeacherModule } from 'src/deletedTeacher/deletedTeacher.module';

@Module({
  imports: [TypeOrmModule.forFeature([Teacher]), JwtModule, DeletedTeacherModule],
  controllers: [TeacherController],
  providers: [TeacherService],
  exports: [TeacherService],
})
export class TeacherModule { }
