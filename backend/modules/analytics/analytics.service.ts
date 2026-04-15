import { Injectable } from "@nestjs/common";
import { Prisma, UpsellEventType } from "@prisma/client";
import { toProductGid } from "../../common/utils/shopify.util";
import { PrismaService } from "../../database/prisma.service";
import { ShopService } from "../shop/shop.service";

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly shopService: ShopService,
  ) {}

  async trackImpression(params: {
    shopDomain: string;
    ruleId?: string;
    sourceProductId?: string;
    recommendedProductId: string;
    orderGid?: string;
    meta?: Record<string, unknown>;
  }): Promise<void> {
    await this.trackEvent({
      ...params,
      type: UpsellEventType.IMPRESSION,
    });
  }

  async trackConversion(params: {
    shopDomain: string;
    ruleId?: string;
    sourceProductId?: string;
    recommendedProductId: string;
    orderGid?: string;
    meta?: Record<string, unknown>;
  }): Promise<void> {
    await this.trackEvent({
      ...params,
      type: UpsellEventType.CONVERSION,
    });
  }

  async getSummary(shopDomain: string, days: number): Promise<{
    impressions: number;
    conversions: number;
    conversionRate: number;
  }> {
    const shop = await this.shopService.getShopByDomain(shopDomain);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [impressions, conversions] = await Promise.all([
      this.prismaService.upsellEvent.count({
        where: {
          shopId: shop.id,
          type: UpsellEventType.IMPRESSION,
          createdAt: { gte: since },
        },
      }),
      this.prismaService.upsellEvent.count({
        where: {
          shopId: shop.id,
          type: UpsellEventType.CONVERSION,
          createdAt: { gte: since },
        },
      }),
    ]);

    const conversionRate = impressions === 0 ? 0 : Number(((conversions / impressions) * 100).toFixed(2));
    return { impressions, conversions, conversionRate };
  }

  async listRecentEvents(shopDomain: string, limit: number): Promise<
    Array<{
      id: string;
      type: UpsellEventType;
      sourceProductId: string | null;
      recommendedProductId: string;
      createdAt: Date;
    }>
  > {
    const shop = await this.shopService.getShopByDomain(shopDomain);
    return this.prismaService.upsellEvent.findMany({
      where: { shopId: shop.id },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        type: true,
        sourceProductId: true,
        recommendedProductId: true,
        createdAt: true,
      },
    });
  }

  private async trackEvent(params: {
    shopDomain: string;
    type: UpsellEventType;
    ruleId?: string;
    sourceProductId?: string;
    recommendedProductId: string;
    orderGid?: string;
    meta?: Record<string, unknown>;
  }): Promise<void> {
    const shop = await this.shopService.getShopByDomain(params.shopDomain);

    await this.prismaService.upsellEvent.create({
      data: {
        shopId: shop.id,
        ruleId: params.ruleId ?? null,
        sourceProductId: params.sourceProductId
          ? toProductGid(params.sourceProductId)
          : null,
        recommendedProductId: toProductGid(params.recommendedProductId),
        orderGid: params.orderGid ?? null,
        type: params.type,
        meta: params.meta
          ? (params.meta as Prisma.InputJsonValue)
          : undefined,
      },
    });
  }
}
