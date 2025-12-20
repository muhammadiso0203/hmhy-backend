import {
  Body,
  Controller,
  Param,
  Post,
  Res,
  HttpCode,
  HttpStatus,
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

@ApiTags("Teacher Auth") 
@Controller("auth/teacher")
export class AuthTeacherController {
  constructor(private readonly authService: AuthTeacherService) {}

  @ApiOperation({ summary: "Tizimga kirish (Login)" })
  @ApiResponse({
    status: 200,
    description:
      "Muvaffaqiyatli kirildi va cookie-ga refresh token o'rnatildi.",
  })
  @ApiResponse({ status: 400, description: "Email yoki parol xato." })
  @HttpCode(HttpStatus.OK)
  @Post("sign-in")
  async signIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.signIn(signInDto, res);
  }

  @ApiOperation({ summary: "Tokenni yangilash (Refresh Token)" })
  @ApiParam({
    name: "id",
    description: "O'qituvchining UUID Id-si",
    example: "uuid-1234-5678",
  })
  @ApiResponse({ status: 200, description: "Access token yangilandi." })
  @ApiResponse({
    status: 403,
    description: "Refresh token yaroqsiz yoki mos kelmadi.",
  })
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
  @ApiResponse({
    status: 200,
    description: "Cookie tozalandi va bazadan token o'chirildi.",
  })
  @HttpCode(HttpStatus.OK)
  @Post("logout")
  signout(
    @CookieGetter("refresh_token") refreshToken: string,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.signOut(refreshToken, res);
  }
}
