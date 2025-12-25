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
import { ApiOperation, ApiResponse, ApiTags, ApiParam, ApiBody } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import * as passport from "passport";
import { TimeUtils } from "../../common/utils/time.utils";
import { RegisterStep2Dto } from "../dto/register-step2.dto";
import { RegisterStep3Dto } from "../dto/register-step3.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/currentUser";
import { IToken } from "../../common/token/interface";
import { ApiBearerAuth } from "@nestjs/swagger";

@ApiTags("Teacher Auth")
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
    return this.authService.signIn(signInDto, res);
  }

  @ApiOperation({ summary: "Tokenni yangilash (Refresh Token)" })
  @ApiParam({ name: "id", description: "O'qituvchi ID", example: "uuid" })
  @ApiResponse({ status: 200, description: "Access token yangilandi" })
  @ApiResponse({ status: 403, description: "Refresh token xato" })
  @HttpCode(HttpStatus.OK)
  @Post(":id/refresh")
  refresh(
    @Param("id") id: string,
    @CookieGetter("refresh_token") refreshToken: string,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.refreshToken(id, refreshToken, res);
  }

  @ApiOperation({ summary: "Tizimdan chiqish (Logout)" })
  @ApiResponse({ status: 200, description: "Muvaffaqiyatli chiqildi" })
  @HttpCode(HttpStatus.OK)
  @Post("logout")
  signout(
    @CookieGetter("refresh_token") refreshToken: string,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.signOut(refreshToken, res);
  }

  @Get("google-calendar-status")
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  @ApiOperation({ summary: "Check Google Calendar connection status" })
  async getGoogleCalendarStatus(@CurrentUser() user: IToken) {
    return this.authService.checkGoogleCalendarStatus(user.id);
  }

  @Get("google/reconnect")
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
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
          return res.redirect("/dashboard");
        });
      }
    )(req, res);
  }

  // Google OAuth endpoints
  @Get("google")
  @ApiOperation({ summary: "Google OAuth login" })
  googleLogin(@Req() req, @Res() res) {
    // Custom authenticate with prompt=consent to force refresh token
    passport.authenticate(
      "google",
      {
        scope: [
          "email",
          "profile",
          // "https://www.googleapis.com/auth/calendar",
          // "https://www.googleapis.com/auth/calendar.events",
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

        // Manually log in the user
        req.logIn(user, (loginErr) => {
          if (loginErr) {
            return res
              .status(500)
              .json({ error: "Login failed", details: loginErr });
          }
          return res.redirect("/dashboard"); // yoki kerakli joyga yo'naltiring
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

    // Agar step 2 bo'lsa
    if (step == 2) {
      return res.redirect(
        `http://localhost:3030/auth/teacher/register/step2/${user.id}`
      );
    }

    // Agar step 'completed' bo'lsa, tokenlarni yaratamiz va cookies ga saqlaymiz
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

      // Teacher dashboard'ga redirect
      return res.redirect(`http://localhost:3030/teacher/dashboard`);
    }

    // Agar account inactive bo'lsa
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
        `http://localhost:3030/login/teacher?error=account_inactive`
      );
    }

    // return res.redirect(
    //   `http://localhost:3030/login/teacher?error=unknown_step`
    // );
    return res.status(200).json({
      message: "Google login muvaffaqiyatli",
      step: step,
      userId: user.id,
      userEmail: user.email,
      instructions: "Endi /register/step2 endpointiga POST so'rovi yuboring",
    });
  }

  @ApiOperation({ summary: "Teacher registration step 2 - Phone and password" })
  @ApiResponse({ status: 200, description: "OTP kod yuborildi" })
  @Post("register/step2/:teacherId")
  async registerStep2(
    @Param("teacherId") teacherId: string,
    @Body() registerStep2Dto: RegisterStep2Dto
  ) {
    return this.authService.registerStep2(teacherId, registerStep2Dto);
  }

  @Post("register/step3")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "3-qadam: OTP kodni tasdiqlash",
    description: "Telefon orqali kelgan 6 xonali kodni tekshirish va akkauntni faollashtirish",
  })
  @ApiBody({ type: RegisterStep3Dto }) 
  @ApiResponse({
    status: 200,
    description: "Profil muvaffaqiyatli faollashtirildi",
    schema: {
      example: {
        message: "Akkaunt faollashtirildi",
        accessToken: "eyJhbGciOiJIUzI1Ni..."
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: "Kod noto'g'ri yoki muddati o'tgan",
  })
  @ApiResponse({
    status: 404,
    description: "Foydalanuvchi topilmadi",
  })
  async registerStep3(@Body() dto: RegisterStep3Dto) {
    return await this.authService.registerStep3(dto);
  }
}
