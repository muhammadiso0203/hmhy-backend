import {
  Body,
  Controller,
  Param,
  Post,
  Res,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
  Get,
} from "@nestjs/common";
import { AuthTeacherService } from "./auth-teacher.service";
import { SignInDto } from "../dto/sign-in.dto";
import { Response } from "express";
import { CookieGetter } from "../../common/decorators/cookie-getter.decorator";
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiBody,
} from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import * as passport from "passport";
import { TimeUtils } from "../../common/utils/time.utils";
import { RegisterStep2Dto } from "../dto/register-step2.dto";
import { RegisterStep3Dto } from "../dto/register-step3.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/currentUser";
import { IToken } from "../../common/token/interface";
import { ApiBearerAuth } from "@nestjs/swagger";
import { successRes } from "../../common/response/succesResponse";

@ApiTags("Teacher Auth")
@ApiBearerAuth("access-token")
@Controller("auth/teacher")
export class AuthTeacherController {
  constructor(private readonly authService: AuthTeacherService) {}

  @ApiOperation({ summary: "Tizimga kirish (Login)" })
  @ApiResponse({ status: 200, description: "Muvaffaqiyatli kirildi" })
  @ApiResponse({ status: 400, description: "Email yoki password noto'g'ri" })
  @HttpCode(HttpStatus.OK)
  @Post("sign-in")
  async signIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.authService.signIn(signInDto, res);
    return successRes(result);
  }

  @ApiOperation({ summary: "Tokenni yangilash (Refresh Token)" })
  @ApiParam({ name: "id", description: "O'qituvchi ID", example: "uuid" })
  @ApiResponse({ status: 200, description: "Access token yangilandi" })
  @ApiResponse({ status: 403, description: "Refresh token xato" })
  @HttpCode(HttpStatus.OK)
  @Post(":id/refresh")
  async refresh(
    @Param("id") id: string,
    @CookieGetter("refresh_token") refreshToken: string,
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.authService.refreshToken(id, refreshToken, res);
    return successRes(result);
  }

  @ApiOperation({ summary: "Tizimdan chiqish (Logout)" })
  @ApiResponse({ status: 200, description: "Muvaffaqiyatli chiqildi" })
  @HttpCode(HttpStatus.OK)
  @Post("logout")
  async signout(
    @CookieGetter("refresh_token") refreshToken: string,
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.authService.signOut(refreshToken, res);
    return successRes(result);
  }

  @Get("google-calendar-status")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Check Google Calendar connection status" })
  async getGoogleCalendarStatus(@CurrentUser() user: IToken) {
    const result = await this.authService.checkGoogleCalendarStatus(user.id);
    return successRes(result);
  }

  @Get("google/reconnect")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Reconnect Google Calendar (forces new consent)" })
  googleReconnect(@Req() req, @Res() res) {
    passport.authenticate(
      "google",
      {
        scope: [
          "email",
          "profile",
          "https://www.googleapis.com/auth/calendar",
          "https://www.googleapis.com/auth/calendar.events",
        ],
        accessType: "offline",
        prompt: "consent",
      } as passport.AuthenticateOptions,
      (err, user, info) => {
        if (err) {
          return res
            .status(500)
            .json({ error: "Authentication failed", details: err });
        }
        if (!user) {
          return res.status(401).json({ error: "No user found", info });
        }
        req.logIn(user, (loginErr) => {
          if (loginErr) {
            return res
              .status(500)
              .json({ error: "Login failed", details: loginErr });
          }
          return res.redirect("/teacher/my-lessons");
        });
      }
    )(req, res);
  }


  // Google OAuth endpoints
  @Get("google")
  @ApiOperation({ summary: "Google OAuth login" })
  googleLogin(@Req() req, @Res() res) {
    passport.authenticate(
      "google",
      {
        scope: ["email", "profile"],
        accessType: "offline",
        prompt: "consent",
      } as passport.AuthenticateOptions,
      (err, user, info) => {
        if (err) {
          return res
            .status(500)
            .json({ error: "Authentication failed", details: err });
        }
        if (!user) {
          return res.status(401).json({ error: "No user found", info });
        }

        req.logIn(user, (loginErr) => {
          if (loginErr) {
            return res
              .status(500)
              .json({ error: "Login failed", details: loginErr });
          }
        });
      }
    )(req, res);
  }

  @Get("google/callback")
  @UseGuards(AuthGuard("google"))
  @ApiOperation({ summary: "Google OAuth callback" })
  @ApiResponse({ status: 200, description: "Google authentication successful" })
  async googleCallback(@Req() req, @Res() res) {
    const { user, step } = req.user;
    console.log("GOOGLE CALLBACK KELDI!");
    console.log("Query params:", req.query);
    console.log("req.user:", req.user);

    if (step == 2) {
      return res.redirect(
        `http://localhost:5173/teacher/register/step2/${user.id}`
      );
    }

    if (step === "completed") {
      const jwtTokens = await this.authService.generateTokens({
        id: user.id,
        role: "TEACHER",
      });

      res.cookie("access_token", jwtTokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: TimeUtils.toMilliseconds(
          process.env.ACCESS_TOKEN_TIME || "15m"
        ),
        path: "/",
      });

      res.cookie("refresh_token", jwtTokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: TimeUtils.toMilliseconds(
          process.env.REFRESH_TOKEN_TIME || "7d"
        ),
        path: "/",
      });

      return res.redirect(`http://localhost:5173/teacher/my-lessons`);
    }

    if (step === "inactive") {
      const jwtTokens = await this.authService.generateTokens({
        id: user.id,
        role: "TEACHER",
      });

      res.cookie("access_token", jwtTokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: TimeUtils.toMilliseconds(
          process.env.ACCESS_TOKEN_TIME || "15m"
        ),
        path: "/",
      });

      res.cookie("refresh_token", jwtTokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: TimeUtils.toMilliseconds(
          process.env.REFRESH_TOKEN_TIME || "7d"
        ),
        path: "/",
      });

      return res.redirect(
        `http://localhost:5173/login/teacher?error=account_inactive`
      );
    }

    const fallbackResult = {
      message: "Google login muvaffaqiyatli",
      step: step,
      userId: user.id,
      userEmail: user.email,
      instructions: "Endi /register/step2 endpointiga POST so'rovi yuboring",
    };
    return successRes(fallbackResult);
  }

  @ApiOperation({ summary: "Teacher registration step 2 - Phone and password" })
  @ApiResponse({ status: 200, description: "OTP kod yuborildi" })
  @Post("register/step2/:teacherId")
  async registerStep2(
    @Param("teacherId") teacherId: string,
    @Body() registerStep2Dto: RegisterStep2Dto
  ) {
    const result = await this.authService.registerStep2(
      teacherId,
      registerStep2Dto
    );
    return successRes(result);
  }


  @Post("register/step3")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "3-qadam: OTP kodni tasdiqlash" })
  async registerStep3(
    @Body() dto: RegisterStep3Dto,
    @Res({ passthrough: true }) res: Response // Response'ni qo'shamiz
  ) {
    // 1. OTP'ni tekshirish va foydalanuvchini faollashtirish
    const result = await this.authService.registerStep3(dto);

    // 2. Agar hammasi yaxshi bo'lsa, tokenlarni generatsiya qilamiz
    // result ichida teacherId qaytishi kerak (yoki dto.teacherId dan foydalanamiz)
    const jwtTokens = await this.authService.generateTokens({
      id: dto.teacherId,
      role: "TEACHER",
    });

    // 3. Cookie'larni o'rnatamiz (Dashboard'ga ruxsat berish uchun)
    res.cookie("access_token", jwtTokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: TimeUtils.toMilliseconds(process.env.ACCESS_TOKEN_TIME || "15m"),
      path: "/",
    });

    res.cookie("refresh_token", jwtTokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: TimeUtils.toMilliseconds(process.env.REFRESH_TOKEN_TIME || "7d"),
      path: "/",
    });

    // 4. Frontend'ga muvaffaqiyat xabarini yuboramiz
    return successRes({
      message: "Profil faollashtirildi va tizimga kirildi",
      accessToken: jwtTokens.accessToken, // Frontend'dagi localStorage uchun
    });
  }
}
