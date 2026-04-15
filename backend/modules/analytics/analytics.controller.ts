import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  Req,
} from "@nestjs/common";
import { Request } from "express";
import { sanitizeShopDomain } from "../../common/utils/shopify.util";
import { TrackEventDto } from "./dto/track-event.dto";
import { AnalyticsService } from "./analytics.service";

@Controller("analytics")
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post("impression")
  @HttpCode(202)
  async impression(@Body() dto: TrackEventDto): Promise<{ ok: boolean }> {
    const shopDomain = sanitizeShopDomain(dto.shop);
    if (!shopDomain) {
      throw new BadRequestException("Invalid shop domain.");
    }

    await this.analyticsService.trackImpression({
      shopDomain,
      ruleId: dto.ruleId,
      sourceProductId: dto.sourceProductId,
      recommendedProductId: dto.recommendedProductId,
      orderGid: dto.orderGid,
      meta: dto.meta,
    });

    return { ok: true };
  }

  @Post("conversion")
  @HttpCode(202)
  async conversion(@Body() dto: TrackEventDto): Promise<{ ok: boolean }> {
    const shopDomain = sanitizeShopDomain(dto.shop);
    if (!shopDomain) {
      throw new BadRequestException("Invalid shop domain.");
    }

    await this.analyticsService.trackConversion({
      shopDomain,
      ruleId: dto.ruleId,
      sourceProductId: dto.sourceProductId,
      recommendedProductId: dto.recommendedProductId,
      orderGid: dto.orderGid,
      meta: dto.meta,
    });

    return { ok: true };
  }

  @Get("summary")
  async summary(
    @Req() req: Request,
    @Query("days") daysRaw?: string,
  ): Promise<{ impressions: number; conversions: number; conversionRate: number }> {
    if (!req.shopDomain) {
      throw new BadRequestException("Missing shop domain in session token.");
    }
    const days = daysRaw ? Number(daysRaw) : 30;
    if (!Number.isFinite(days) || days <= 0) {
      throw new BadRequestException("days must be a positive number.");
    }
    return this.analyticsService.getSummary(req.shopDomain, days);
  }

  @Get("events")
  async events(
    @Req() req: Request,
    @Query("limit") limitRaw?: string,
  ) {
    if (!req.shopDomain) {
      throw new BadRequestException("Missing shop domain in session token.");
    }
    const limit = limitRaw ? Number(limitRaw) : 20;
    if (!Number.isFinite(limit) || limit <= 0 || limit > 100) {
      throw new BadRequestException("limit must be between 1 and 100.");
    }
    return this.analyticsService.listRecentEvents(req.shopDomain, limit);
  }
}
