import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Observable } from "rxjs";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers.authorization;

    let token: string | undefined;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
    else if (req.cookies) {
      token =
        req.cookies.adminToken ||
        req.cookies.refresh_token ||
        req.cookies.teacherToken;
    }

    if (!token) {
      throw new UnauthorizedException({ message: "Token topilmadi" });
    }

    try {
      const token =
        req.headers.authorization?.split(" ")[1] || req.cookies?.refresh_token;

      if (!token)
        throw new UnauthorizedException({ message: "Token topilmadi" });

      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.REFRESH_TOKEN_KEY, 
      });

      req.user = payload;
      return true;
    } catch (error) {
      console.log("Verify Error:", error.message);
      throw new UnauthorizedException({
        message: "Token yaroqsiz yoki muddati o'tgan",
      });
    }
  }
}
