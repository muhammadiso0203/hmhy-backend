import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Response } from "express";
import * as bcrypt from "bcrypt";

import { Student } from "../../student/entities/student.entity";
import { SignInDto } from "../dto/sign-in.dto";
import { RegisterStep2Dto } from "../dto/register-step2.dto";
import { RegisterStep3Dto } from "../dto/register-step3.dto";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { MailService } from "../../mail/mail.service";
import { StudentsService } from "../../student/student.service";
import { SignInDtoStudent } from "../dto/sign-in-student.dto";

@Injectable()
export class AuthStudentService {
  constructor(
    private readonly studentsService: StudentsService,
    private readonly jwtService: JwtService,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    private readonly mailService: MailService
  ) {}

  async generateTokens(payloadData: { id: string; role: string }) {
    const payload = {
      id: payloadData.id,
      role: payloadData.role,
    };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        payload as any,
        {
          secret: process.env.ACCESS_TOKEN_KEY!,
          expiresIn: process.env.ACCESS_TOKEN_TIME as any,
        } as any
      ),
      this.jwtService.signAsync(
        payload as any,
        {
          secret: process.env.REFRESH_TOKEN_KEY!,
          expiresIn: process.env.REFRESH_TOKEN_TIME as any,
        } as any
      ),
    ]);

    return { accessToken, refreshToken };
  }

  async signIn(signInDto: SignInDtoStudent, res: Response) {
    const student = await this.studentsService.findByPhoneNumber(
      signInDto.phoneNumber
    );

    if (!student) {
      throw new BadRequestException("Telefon raqam noto'g'ri");
    }

    const { accessToken, refreshToken } = await this.generateTokens(student);

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 7);
    await this.studentsService.updateRefreshToken(
      student.id,
      hashedRefreshToken
    );

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      maxAge: Number(process.env.COOKIE_TIME) || 15 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production",
    });

    return {
      message: "Tizimga xush kelibsiz",
      accessToken,
      studentId: student.id,
    };
  }

  async refreshToken(studentId: string, refresh_token: string, res: Response) {
    const student =
      await this.studentsService.findOneWithRefreshToken(studentId);

    if (!student || !student.data) {
      throw new ForbiddenException("Ruxsat etilmagan (Token topilmadi)");
    }

    if (!student.data.refreshToken) {
      throw new ForbiddenException("Ruxsat etilmagan (Token topilmadi)");
    }

    const tokenMatch = await bcrypt.compare(
      refresh_token,
      student.data.refreshToken
    );

    if (!tokenMatch) {
      throw new ForbiddenException("Token mos kelmadi");
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await this.generateTokens(student.data);

    const hashedRefreshToken = await bcrypt.hash(newRefreshToken, 7);
    await this.studentsService.updateRefreshToken(
      student.data.id,
      hashedRefreshToken
    );

    res.cookie("refresh_token", newRefreshToken, {
      maxAge: Number(process.env.COOKIE_TIME),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    return {
      message: "Token yangilandi",
      accessToken,
    };
  }

  async signOut(refreshToken: string, res: Response) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.REFRESH_TOKEN_KEY,
      });

      await this.studentsService.updateRefreshToken(payload.id, null);

      res.clearCookie("refresh_token");

      return { message: "User logged out successfully" };
    } catch (e) {
      throw new ForbiddenException("Token yaroqsiz yoki muddati o'tgan");
    }
  }
}
