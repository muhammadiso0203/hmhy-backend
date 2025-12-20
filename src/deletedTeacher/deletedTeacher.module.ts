import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";
import { DeletedTeacher } from "./entities/deletedTeacher.entity";
import { DeletedTeachersController } from "./deletedTeacher.controller";
import { DeletedTeachersService } from "./deletedTeacher.service";

@Module({
  imports: [TypeOrmModule.forFeature([DeletedTeacher])],
  controllers: [DeletedTeachersController],
  providers: [DeletedTeachersService],
  exports: [DeletedTeachersService],
})
export class DeletedTeacherModule {}
