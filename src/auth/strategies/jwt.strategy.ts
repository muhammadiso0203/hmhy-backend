import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor() {
    super({
      jwtFromRequest: (req) => {
        let token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

        if (!token && req.headers) {
          token =
            req.headers["authorization"]?.split(" ")[1] ||
            req.headers["access-token"];
        }

        return token;
      },
      ignoreExpiration: false,
      secretOrKey: process.env.ACCESS_TOKEN_KEY!,
    });
    console.log(
      "2. .env dan olingan Secret Key:",
      process.env.ACCESS_TOKEN_KEY
    );
  }

  async validate(payload: any) {
    return {
      userId: payload.sub,
      username: payload.username,
      role: payload.role,
    };  
  } 
}  
