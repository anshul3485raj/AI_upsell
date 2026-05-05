import { Injectable } from "@nestjs/common";
import { Prisma, UpsellEventType } from "@prisma/client";
import { parseNumericIdFromGid, toProductGid } from "../../common/utils/shopify.util";
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
    sales: number;
    clicks: number;
    addedToCart: number;
    impressions: number;
    conversions: number;
    conversionRate: number;
    dailySeries: number[];
    topProducts: Array<{
      productId: string;
      title: string;
      sales: number;
      conversions: number;
      imageUrl: string | null;
    }>;
  }> {
    const shop = await this.shopService.getShopByDomain(shopDomain);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [events, orders] = await Promise.all([
      this.prismaService.upsellEvent.findMany({
        where: {
          shopId: shop.id,
          createdAt: { gte: since },
        },
        orderBy: { createdAt: "asc" },
        select: {
          type: true,
          recommendedProductId: true,
          createdAt: true,
        },
      }),
      this.prismaService.order.findMany({
        where: {
          shopId: shop.id,
          createdAt: { gte: since },
        },
        select: {
          lineItems: true,
        },
      }),
    ]);

    const impressions = events.filter((event) => event.type === UpsellEventType.IMPRESSION).length;
    const conversions = events.filter((event) => event.type === UpsellEventType.CONVERSION).length;
    const clicks = conversions;
    const addedToCart = conversions;
    const conversionRate = impressions === 0 ? 0 : Number(((conversions / impressions) * 100).toFixed(2));
    const conversionCounts = new Map<string, number>();

    for (const event of events) {
      if (event.type !== UpsellEventType.CONVERSION) {
        continue;
      }
      conversionCounts.set(
        event.recommendedProductId,
        (conversionCounts.get(event.recommendedProductId) ?? 0) + 1,
      );
    }

    const convertedProductIds = new Set(
      Array.from(conversionCounts.keys()).map((id) => parseNumericIdFromGid(id) ?? id),
    );

    let sales = 0;
    const attributedSalesByProduct = new Map<string, number>();

    for (const order of orders) {
      const lineItems = Array.isArray(order.lineItems) ? order.lineItems : [];
      for (const rawLineItem of lineItems) {
        const lineItem = rawLineItem as Record<string, unknown>;
        const numericId = lineItem.product_id ? String(lineItem.product_id) : null;
        const graphQlId = lineItem.admin_graphql_api_id
          ? parseNumericIdFromGid(String(lineItem.admin_graphql_api_id))
          : null;
        const productId = numericId ?? graphQlId;

        if (!productId || !convertedProductIds.has(productId)) {
          continue;
        }

        const price = Number(lineItem.price ?? 0);
        const quantity = Number(lineItem.quantity ?? 1);
        const lineTotal = price * quantity;
        sales += lineTotal;
        attributedSalesByProduct.set(productId, (attributedSalesByProduct.get(productId) ?? 0) + lineTotal);
      }
    }

    const productDetails = await this.shopService.fetchProductsByGids(
      shopDomain,
      Array.from(conversionCounts.keys()).slice(0, 8),
    );
    const productByNumericId = new Map(
      productDetails.map((product) => [parseNumericIdFromGid(product.id) ?? product.id, product]),
    );

    const topProducts = Array.from(conversionCounts.entries())
      .map(([productGid, totalConversions]) => {
        const numericId = parseNumericIdFromGid(productGid) ?? productGid;
        const product = productByNumericId.get(numericId);
        return {
          productId: numericId,
          title: product?.title ?? `Product ${numericId}`,
          sales: Number((attributedSalesByProduct.get(numericId) ?? 0).toFixed(2)),
          conversions: totalConversions,
          imageUrl: product?.featuredImageUrl ?? null,
        };
      })
      .sort((left, right) => right.sales - left.sales || right.conversions - left.conversions)
      .slice(0, 4);

    const dayStart = new Date(since);
    dayStart.setHours(0, 0, 0, 0);
    const dailySeries = Array.from({ length: days }, (_unused, index) => {
      const currentDay = new Date(dayStart);
      currentDay.setDate(dayStart.getDate() + index);
      const nextDay = new Date(currentDay);
      nextDay.setDate(nextDay.getDate() + 1);

      return events.filter(
        (event) =>
          event.type === UpsellEventType.CONVERSION &&
          event.createdAt >= currentDay &&
          event.createdAt < nextDay,
      ).length;
    });

    return {
      sales: Number(sales.toFixed(2)),
      clicks,
      addedToCart,
      impressions,
      conversions,
      conversionRate,
      dailySeries,
      topProducts,
    };
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
