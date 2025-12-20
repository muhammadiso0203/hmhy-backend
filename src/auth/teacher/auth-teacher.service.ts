import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Response } from "express";
import * as bcrypt from "bcrypt";

import { Teacher } from "../../teacher/entities/teacher.entity";
import { SignInDto } from "../dto/sign-in.dto";
import { TeacherService } from "src/teacher/teacher.service";

@Injectable()
export class AuthTeacherService {
  constructor(
    private readonly teachersService: TeacherService,
    private readonly jwtService: JwtService
  ) {}

  async generateTokens(teacher: Teacher) {
    const payload = {
      id: teacher.id,
      role: teacher.role,
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

  async signIn(signInDto: SignInDto, res: Response) {
    const teacher = await this.teachersService.findTeacherByEmail(
      signInDto.email
    );

    if (!teacher) {
      throw new BadRequestException("Email yoki password noto'g'ri");
    }

    const isValidPassword = await bcrypt.compare(
      signInDto.password,
      teacher.password
    );

    if (!isValidPassword) {
      throw new BadRequestException("Email yoki password noto'g'ri");
    }

    const { accessToken, refreshToken } = await this.generateTokens(teacher);

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 7);
    await this.teachersService.updateRefreshToken(
      teacher.id,
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
      teacherId: teacher.id,
    };
  }

  async refreshToken(teacherId: string, refresh_token: string, res: Response) {
    const teacher = await this.teachersService.findOneWithRefreshToken(teacherId);

    if (!teacher || !teacher.data) {
      throw new ForbiddenException("Ruxsat etilmagan (Token topilmadi)");
    }

    if (!teacher.data.refreshToken) {
      throw new ForbiddenException("Ruxsat etilmagan (Token topilmadi)");
    }

    const tokenMatch = await bcrypt.compare(
      refresh_token,
      teacher.data.refreshToken
    );

    if (!tokenMatch) {
      throw new ForbiddenException("Token mos kelmadi");
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await this.generateTokens(teacher.data);

    const hashedRefreshToken = await bcrypt.hash(newRefreshToken, 7);
    await this.teachersService.updateRefreshToken(
      teacher.data.id,
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

      await this.teachersService.updateRefreshToken(payload.id, null);

      res.clearCookie("refresh_token");

      return { message: "User logged out successfully" };
    } catch (e) {
      throw new ForbiddenException("Token yaroqsiz yoki muddati o'tgan");
    }
  }
}
