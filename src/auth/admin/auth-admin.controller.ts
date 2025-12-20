import {
  Body,
  Controller,
  Param,
  Post,
  Res,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";
import { CookieGetter } from "../../common/decorators/cookie-getter.decorator";
import { ApiOperation, ApiResponse, ApiTags, ApiParam } from "@nestjs/swagger";
import { SignInDtoAdmin } from "../dto/sign-in-admin.dto";
import { AuthAdminService } from "./auth-admin.service";

@ApiTags("Admin Auth")
@Controller("auth/admin")
export class AuthAdminController {
  constructor(private readonly authService: AuthAdminService) {}

  @ApiOperation({ summary: "Admin tizimga kirishi (Login)" })
  @ApiResponse({
    status: 200,
    description:
      "Muvaffaqiyatli kirildi va cookie-ga refresh token o'rnatildi.",
  })
  @ApiResponse({ status: 401, description: "Username yoki parol xato." })
  @HttpCode(HttpStatus.OK)
  @Post("sign-in")
  async signIn(
    @Body() signInDto: SignInDtoAdmin,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.signIn(signInDto, res);
  }

  @ApiOperation({ summary: "Admin tokenini yangilash (Refresh Token)" })
  @ApiParam({
    name: "id",
    description: "Adminning UUID Id-si",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @ApiResponse({ status: 200, description: "Access token yangilandi." })
  @ApiResponse({
    status: 403,
    description: "Refresh token yaroqsiz yoki muddati o'tgan.",
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

  @ApiOperation({ summary: "Admin tizimdan chiqishi (Logout)" })
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
