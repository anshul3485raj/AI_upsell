import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Param,
  Post,
  Query,
  Req,
} from "@nestjs/common";
import { Request } from "express";
import { sanitizeShopDomain } from "../../common/utils/shopify.util";
import { CreateRuleDto } from "./dto/create-rule.dto";
import { UpdateRuleDto } from "./dto/update-rule.dto";
import { UpsellService } from "./upsell.service";

@Controller("upsell")
export class UpsellController {
  constructor(private readonly upsellService: UpsellService) {}

  @Get()
  async recommendations(
    @Req() req: Request,
    @Query("shop") shop: string | undefined,
    @Query("productId") productId: string | undefined,
    @Query("cartProductIds") cartProductIds: string | undefined,
  ): Promise<{
    sourceProductId: string | null;
    recommendations: Array<{
      id: string;
      title: string;
      handle: string | null;
      imageUrl: string | null;
      price: number;
      currencyCode: string | null;
      variantId: string | null;
      variantLegacyId: string | null;
      discount: {
        type: string;
        value: number;
      };
      ruleId: string | null;
    }>;
  }> {
    const resolvedShop = req.shopDomain ?? sanitizeShopDomain(shop ?? "");
    if (!resolvedShop) {
      throw new BadRequestException("shop query param is required for public calls.");
    }

    const parsedCartIds = cartProductIds
      ? cartProductIds
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean)
      : [];

    return this.upsellService.getRecommendations({
      shopDomain: resolvedShop,
      productId,
      cartProductIds: parsedCartIds,
    });
  }

  @Get("rules")
  async listRules(@Req() req: Request) {
    if (!req.shopDomain) {
      throw new BadRequestException("Missing shop domain in session token.");
    }
    return this.upsellService.listRules(req.shopDomain);
  }

  @Get("rules/:id")
  async getRule(@Req() req: Request, @Param("id") id: string) {
    if (!req.shopDomain) {
      throw new BadRequestException("Missing shop domain in session token.");
    }
    return this.upsellService.getRule(req.shopDomain, id);
  }

  @Post("rules")
  async createRule(@Req() req: Request, @Body() dto: CreateRuleDto) {
    if (!req.shopDomain) {
      throw new BadRequestException("Missing shop domain in session token.");
    }
    return this.upsellService.createRule(req.shopDomain, dto);
  }

  @Patch("rules/:id")
  async updateRule(@Req() req: Request, @Param("id") id: string, @Body() dto: UpdateRuleDto) {
    if (!req.shopDomain) {
      throw new BadRequestException("Missing shop domain in session token.");
    }
    return this.upsellService.updateRule(req.shopDomain, id, dto);
  }

  @Delete("rules/:id")
  async deleteRule(@Req() req: Request, @Param("id") id: string): Promise<{ deleted: boolean }> {
    if (!req.shopDomain) {
      throw new BadRequestException("Missing shop domain in session token.");
    }
    await this.upsellService.deleteRule(req.shopDomain, id);
    return { deleted: true };
  }
}
