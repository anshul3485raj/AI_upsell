import { Module } from "@nestjs/common";
import { CommonModule } from "../../common/common.module";
import { ShopModule } from "../shop/shop.module";
import { UpsellController } from "./upsell.controller";
import { UpsellService } from "./upsell.service";

@Module({
  imports: [CommonModule, ShopModule],
  controllers: [UpsellController],
  providers: [UpsellService],
  exports: [UpsellService],
})
export class UpsellModule {}
