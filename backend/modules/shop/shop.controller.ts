import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Post,
  Put,
  Req,
} from "@nestjs/common";
import { Request } from "express";
import { sanitizeShopDomain } from "../../common/utils/shopify.util";
import { ShopService } from "./shop.service";

@Controller("shop")
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Get("me")
  async me(@Req() req: Request): Promise<{ domain: string; installedAt: Date }> {
    if (!req.shopDomain) {
      throw new BadRequestException("Session shop domain was not found.");
    }
    return this.shopService.getShopProfile(req.shopDomain);
  }

  @Put("token")
  @HttpCode(204)
  async rotateToken(
    @Req() req: Request,
    @Body() body: { accessToken?: string },
  ): Promise<void> {
    if (!req.shopDomain || !body.accessToken) {
      throw new BadRequestException("shopDomain and accessToken are required.");
    }
    await this.shopService.rotateAccessToken(req.shopDomain, body.accessToken);
  }

  @Post("webhooks")
  @HttpCode(200)
  async webhook(
    @Req() req: Request,
    @Headers("x-shopify-topic") topicHeader: string,
    @Headers("x-shopify-shop-domain") webhookShopDomain: string,
    @Body() payload: Record<string, unknown>,
  ): Promise<{ ok: boolean }> {
    const topic = topicHeader?.toLowerCase();
    const shopDomain = sanitizeShopDomain(webhookShopDomain);

    if (!topic || !shopDomain) {
      throw new BadRequestException("Invalid webhook topic or shop domain.");
    }

    if (!req.rawBody) {
      throw new BadRequestException("Webhook raw body was not captured.");
    }

    if (topic === "app/uninstalled") {
      await this.shopService.handleAppUninstalled(shopDomain);
      return { ok: true };
    }

    if (topic === "orders/create") {
      await this.shopService.handleOrderCreate(shopDomain, payload);
      return { ok: true };
    }

    if (topic === "products/update") {
      await this.shopService.handleProductUpdate(shopDomain, payload);
      return { ok: true };
    }

    return { ok: true };
  }
}
