import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Response } from "express";
import * as bcrypt from "bcrypt";
import { AdminService } from "../../admin/admin.service";
import { Admin } from "../../admin/entities/admin.entity";
import { SignInDtoAdmin } from "../dto/sign-in-admin.dto";

@Injectable()
export class AuthAdminService {
  constructor(
    private readonly adminService: AdminService,
    private readonly jwtService: JwtService
  ) {}

  async generateTokens(admin: Admin) {
    const payload = {
      id: admin.id,
      role: admin.role,
      username: admin.username,
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

  async signIn(signInDto: SignInDtoAdmin, res: Response) {
    const admin = await this.adminService.findAdminByUsername(
      signInDto.username
    );

    if (!admin) {
      throw new UnauthorizedException("Username yoki password noto'g'ri");
    }

    const isValidPassword = await bcrypt.compare(
      signInDto.password,
      admin.password
    );

    if (!isValidPassword) {
      throw new UnauthorizedException("Username yoki password noto'g'ri");
    }

    const { accessToken, refreshToken } = await this.generateTokens(admin);

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 7);
    await this.adminService.updateRefreshToken(admin.id, hashedRefreshToken);

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      maxAge: Number(process.env.COOKIE_TIME) || 15 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return {
      message: "Tizimga xush kelibsiz",
      accessToken,
      adminId: admin.id,
    };
  }

  async refreshToken(adminId: string, refresh_token: string, res: Response) {
    const admin = await this.adminService.findOne(adminId);

    if (!admin || !admin.refreshToken) {
      throw new ForbiddenException("Ruxsat etilmagan (Token topilmadi)");
    }

    const tokenMatch = await bcrypt.compare(refresh_token, admin.refreshToken);

    if (!tokenMatch) {
      throw new ForbiddenException("Token mos kelmadi");
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await this.generateTokens(admin);

    const hashedRefreshToken = await bcrypt.hash(newRefreshToken, 7);
    await this.adminService.updateRefreshToken(admin.id, hashedRefreshToken);

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

      await this.adminService.updateRefreshToken(payload.id, null);
      res.clearCookie("refresh_token");

      return { message: "Admin tizimdan muvaffaqiyatli chiqdi" };
    } catch (e) {
      throw new ForbiddenException("Token yaroqsiz yoki muddati o'tgan");
    }
  }
}
