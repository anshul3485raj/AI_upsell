import { Module } from "@nestjs/common";
import { CommonModule } from "../../common/common.module";
import { ShopModule } from "../shop/shop.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

@Module({
  imports: [CommonModule, ShopModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
