import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20";
import { Injectable } from "@nestjs/common";
import { AuthTeacherService } from "../teacher/auth-teacher.service";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(private readonly authService: AuthTeacherService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: "http://localhost:3000/api/v1/auth/teacher/google/callback",
      scope: ["email", "profile"],
    });
  }

  async validate(accessToken, refreshToken, profile, done) {
    const googleUser = {
      email: profile.emails[0].value,
      fullName: profile.displayName,
      image: profile.photos[0].value,
      accessToken,
      refreshToken,
    };
    const savedUser = await this.authService.validateGoogleUser(googleUser);

    const result = {
      user: savedUser,
      step: savedUser.phoneNumber ? "completed" : "2",
    };

    done(null, result);
  }
}
