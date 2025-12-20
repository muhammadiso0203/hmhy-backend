import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { Admin } from "./entities/admin.entity";
import { JwtModule } from "@nestjs/jwt";
import { CryptoService } from "src/common/crypto/cryptoService";

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin]),
    JwtModule.register({
      secret: process.env.ACCESS_TOKEN_KEY || "SECRET", 
      signOptions: { expiresIn: "24h" },
    }),
  ],
  controllers: [AdminController],
  providers: [AdminService, CryptoService],
  exports: [AdminService],
})
export class AdminModule {}
