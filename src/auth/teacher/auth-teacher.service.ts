import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Response } from "express";
import * as bcrypt from "bcrypt";

import { Teacher } from "../../teacher/entities/teacher.entity";
import { SignInDto } from "../dto/sign-in.dto";
import { TeacherService } from "src/teacher/teacher.service";
import { RegisterStep2Dto } from "../dto/register-step2.dto";
import { RegisterStep3Dto } from "../dto/register-step3.dto";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { MailService } from "../../mail/mail.service";

@Injectable()
export class AuthTeacherService {
  constructor(
    private readonly teachersService: TeacherService,
    private readonly jwtService: JwtService,
    @InjectRepository(Teacher)
    private readonly teacherRepo: Repository<Teacher>,
    private readonly mailService: MailService,

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
    const teacher =
      await this.teachersService.findOneWithRefreshToken(teacherId);

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

  async googleLogin(reqUser: any, res: Response) {
    let teacher = await this.teachersService.findTeacherByEmail(reqUser.email);

    if (!teacher) {
      teacher = await this.teachersService.create({
        email: reqUser.email,
        fullName: `${reqUser.firstName} ${reqUser.lastName}`,
        image: reqUser.picture,
        isActive: true,
        password: "",
      });
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

  async registerStep2(teacherId: string, dto: RegisterStep2Dto) {
    const result = await this.teachersService.findOne(teacherId);
    const teacher = result.data;
    if (!teacher) {
      throw new NotFoundException("O'qituvchi topilmadi");
    }

    const hashedPassword = await bcrypt.hash(dto.password, 7);

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    const otpExpires = new Date(Date.now() + 2 * 60 * 1000);

    await this.teachersService.updateTeacher(teacherId, {
      phoneNumber: dto.phone,
      password: hashedPassword,
      otpCode: otpCode,
      otpExpires: otpExpires,
    });

    await this.mailService.sendMail(teacher.email, teacher.fullName, otpCode);
    console.log(`SMS yuborildi: ${dto.phone} -> Kod: ${otpCode}`);

    return {
      success: true,
      message: "Telefon raqami saqlandi va OTP kod yuborildi",
      teacherId: teacher.id,
    };
  }

  async validateGoogleUser(googleUser: any) {
    let teacher = await this.teachersService.findTeacherByEmail(
      googleUser.email
    );

    const updateData: any = {};
    if (googleUser.accessToken) updateData.googleAccessToken = googleUser.accessToken;
    if (googleUser.refreshToken) updateData.googleRefreshToken = googleUser.refreshToken;

    if (!teacher) {
      teacher = await this.teachersService.create({
        email: googleUser.email,
        fullName: googleUser.fullName,
        image: googleUser.image,
        isActive: false,
        ...updateData,
      });
    } else {
        if (Object.keys(updateData).length > 0) {
            await this.teacherRepo.update(teacher.id, updateData);
        }
    }

    return teacher;
  }

  async registerStep3(dto: RegisterStep3Dto) {
    const teacher = await this.teacherRepo
      .createQueryBuilder("teacher")
      .where("teacher.id = :id", { id: dto.teacherId })
      .addSelect("teacher.otpCode")
      .addSelect("teacher.otpExpires")
      .getOne();

    if (!teacher) {
      throw new NotFoundException("O'qituvchi topilmadi");
    }

    if (teacher.otpCode !== dto.otpCode) {
      throw new BadRequestException("Tasdiqlash kodi noto'g'ri");
    }

    if (new Date() > teacher.otpExpires) {
      throw new BadRequestException(
        "Kodning muddati tugagan, qaytadan yuboring"
      );
    }

    await this.teachersService.updateTeacher(teacher.id, {
      isActive: true,
      otpCode: null,
      otpExpires: null,
    });

    const tokens = await this.getTokens(teacher.id, teacher.email);

    const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 7);

    await this.teachersService.updateTeacher(teacher.id, {
      refreshToken: hashedRefreshToken,
    });

    return {
      success: true,
      message: "Tabriklaymiz, profilingiz muvaffaqiyatli faollashtirildi!",
      ...tokens,
    };
  }

  async getTokens(teacherId: string, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: teacherId, email },
        { secret: process.env.ACCESS_TOKEN_KEY, expiresIn: "15m" }
      ),
      this.jwtService.signAsync(
        { sub: teacherId, email },
        { secret: process.env.REFRESH_TOKEN_KEY, expiresIn: "7d" }
      ),
    ]);

    return { accessToken, refreshToken };
  }

  async checkGoogleCalendarStatus(teacherId: string) {
    const result = await this.teachersService.findOne(teacherId);
    const teacher = result.data;

    if (!teacher) {
      throw new NotFoundException("O'qituvchi topilmadi");
    }

    return {
      isConnected: !!teacher.googleRefreshToken,
      googleEmail: teacher.email, // Assuming google login uses same email, or we could store google email separately if needed.
    };
  }
}
