import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { DiscountType, Product, Prisma, TriggerType } from "@prisma/client";
import { CacheService } from "../../common/services/cache.service";
import {
  parseNumericIdFromGid,
  toCollectionGid,
  toProductGid,
} from "../../common/utils/shopify.util";
import { PrismaService } from "../../database/prisma.service";
import { ShopService } from "../shop/shop.service";
import { CreateRuleDto } from "./dto/create-rule.dto";
import { UpdateRuleDto } from "./dto/update-rule.dto";

type Recommendation = {
  id: string;
  title: string;
  handle: string | null;
  imageUrl: string | null;
  price: number;
  currencyCode: string | null;
  variantId: string | null;
  variantLegacyId: string | null;
  discount: {
    type: DiscountType;
    value: number;
  };
  ruleId: string | null;
};

@Injectable()
export class UpsellService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly shopService: ShopService,
    private readonly cacheService: CacheService,
  ) {}

  async createRule(shopDomain: string, dto: CreateRuleDto): Promise<{ id: string }> {
    const shop = await this.shopService.getShopByDomain(shopDomain);

    const rule = await this.prismaService.upsellRule.create({
      data: {
        ...(this.buildRuleWriteData(dto) as Prisma.UpsellRuleUncheckedCreateInput),
        shopId: shop.id,
      },
      select: { id: true },
    });

    this.cacheService.invalidate(`upsell:${shopDomain}:`);
    return rule;
  }

  async getRule(shopDomain: string, id: string) {
    const shop = await this.shopService.getShopByDomain(shopDomain);
    const rule = await this.prismaService.upsellRule.findFirst({
      where: { id, shopId: shop.id },
      select: {
        id: true,
        name: true,
        triggerType: true,
        sourceProductId: true,
        sourceCollectionId: true,
        sourceTag: true,
        manualRecommendations: true,
        discountType: true,
        discountValue: true,
        isActive: true,
      },
    });

    if (!rule) {
      throw new NotFoundException("Upsell rule not found.");
    }

    return this.serializeRule(rule);
  }

  async listRules(shopDomain: string): Promise<
    Array<{
      id: string;
      name: string;
      triggerType: TriggerType;
      sourceProductId: string | null;
      sourceCollectionId: string | null;
      sourceTag: string | null;
      manualRecommendations: string[];
      discountType: DiscountType;
      discountValue: number;
      isActive: boolean;
    }>
  > {
    const shop = await this.shopService.getShopByDomain(shopDomain);
    const rules = await this.prismaService.upsellRule.findMany({
      where: { shopId: shop.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        triggerType: true,
        sourceProductId: true,
        sourceCollectionId: true,
        sourceTag: true,
        manualRecommendations: true,
        discountType: true,
        discountValue: true,
        isActive: true,
      },
    });

    return rules.map((rule) => this.serializeRule(rule));
  }

  async updateRule(
    shopDomain: string,
    id: string,
    dto: UpdateRuleDto,
  ): Promise<{ id: string }> {
    const shop = await this.shopService.getShopByDomain(shopDomain);
    const existingRule = await this.prismaService.upsellRule.findFirst({
      where: { id, shopId: shop.id },
      select: { id: true },
    });

    if (!existingRule) {
      throw new NotFoundException("Upsell rule not found.");
    }

    await this.prismaService.upsellRule.update({
      where: { id },
      data: this.buildRuleWriteData(dto),
      select: { id: true },
    });

    this.cacheService.invalidate(`upsell:${shopDomain}:`);
    return { id };
  }

  async deleteRule(shopDomain: string, id: string): Promise<void> {
    const shop = await this.shopService.getShopByDomain(shopDomain);
    await this.prismaService.upsellRule.deleteMany({
      where: { id, shopId: shop.id },
    });
    this.cacheService.invalidate(`upsell:${shopDomain}:`);
  }

  async getRecommendations(params: {
    shopDomain: string;
    productId?: string;
    cartProductIds?: string[];
  }): Promise<{
    sourceProductId: string | null;
    recommendations: Recommendation[];
  }> {
    const productGid = params.productId ? toProductGid(params.productId) : null;
    const cartProductGids = (params.cartProductIds ?? []).map((id) => toProductGid(id));

    if (!productGid && cartProductGids.length === 0) {
      throw new BadRequestException("productId or cartProductIds is required.");
    }

    const cacheKey = `upsell:${params.shopDomain}:${productGid ?? "cart"}:${cartProductGids.join(",")}`;
    const cached = this.cacheService.get<{
      sourceProductId: string | null;
      recommendations: Recommendation[];
    }>(cacheKey);
    if (cached) {
      return cached;
    }

    const shop = await this.shopService.getShopByDomain(params.shopDomain);
    const triggerType = productGid ? TriggerType.PRODUCT : TriggerType.CART;
    const sourceProductGid = productGid ?? cartProductGids[0] ?? null;

    if (sourceProductGid) {
      await this.shopService.ensureProductSnapshot(params.shopDomain, sourceProductGid);
    }

    const sourceProduct = sourceProductGid
      ? await this.prismaService.product.findUnique({
          where: {
            shopId_productGid: {
              shopId: shop.id,
              productGid: sourceProductGid,
            },
          },
        })
      : null;

    const activeRules = await this.prismaService.upsellRule.findMany({
      where: {
        shopId: shop.id,
        triggerType,
        isActive: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const matchingRules = activeRules.filter((rule) => {
      if (!sourceProduct && (rule.sourceProductId || rule.sourceCollectionId || rule.sourceTag)) {
        return false;
      }
      if (rule.sourceProductId && rule.sourceProductId !== sourceProductGid) {
        return false;
      }
      if (
        rule.sourceCollectionId &&
        sourceProduct &&
        !sourceProduct.collectionIds.includes(rule.sourceCollectionId)
      ) {
        return false;
      }
      if (
        rule.sourceTag &&
        sourceProduct &&
        !sourceProduct.tags.map((tag) => tag.toLowerCase()).includes(rule.sourceTag.toLowerCase())
      ) {
        return false;
      }
      return true;
    });

    const manualCandidateIds = Array.from(
      new Set(matchingRules.flatMap((rule) => rule.manualRecommendations)),
    ).filter((id) => id !== sourceProductGid);

    const fallbackCandidateIds = await this.findRuleBasedCandidates({
      shopId: shop.id,
      sourceProduct,
      excludeProductId: sourceProductGid ?? undefined,
      limit: 8,
    });

    const candidateIds = Array.from(new Set([...manualCandidateIds, ...fallbackCandidateIds])).slice(
      0,
      8,
    );

    const products = await this.shopService.fetchProductsByGids(params.shopDomain, candidateIds);
    const primaryRule = matchingRules[0] ?? null;
    const recommendations: Recommendation[] = products.map((product) => ({
      id: product.id,
      title: product.title,
      handle: product.handle,
      imageUrl: product.featuredImageUrl,
      price: product.price,
      currencyCode: product.currencyCode,
      variantId: product.variantGid,
      variantLegacyId: product.variantLegacyId,
      discount: {
        type: primaryRule?.discountType ?? DiscountType.NONE,
        value: primaryRule?.discountValue ?? 0,
      },
      ruleId: primaryRule?.id ?? null,
    }));

    const result = {
      sourceProductId: sourceProductGid,
      recommendations,
    };

    const ttlSeconds = Number(process.env.CACHE_TTL_SECONDS ?? 45);
    this.cacheService.set(cacheKey, result, ttlSeconds);
    return result;
  }

  private async findRuleBasedCandidates(params: {
    shopId: string;
    sourceProduct: Product | null;
    excludeProductId?: string;
    limit: number;
  }): Promise<string[]> {
    if (!params.sourceProduct) {
      const items = await this.prismaService.product.findMany({
        where: {
          shopId: params.shopId,
          productGid: params.excludeProductId ? { not: params.excludeProductId } : undefined,
        },
        select: { productGid: true },
        take: params.limit,
        orderBy: { updatedAt: "desc" },
      });
      return items.map((item) => item.productGid);
    }

    const orFilters: Prisma.ProductWhereInput[] = [];
    if (params.sourceProduct.collectionIds.length > 0) {
      orFilters.push({
        collectionIds: {
          hasSome: params.sourceProduct.collectionIds,
        },
      });
    }
    if (params.sourceProduct.tags.length > 0) {
      orFilters.push({
        tags: {
          hasSome: params.sourceProduct.tags,
        },
      });
    }

    const where: Prisma.ProductWhereInput = {
      shopId: params.shopId,
      productGid: params.excludeProductId ? { not: params.excludeProductId } : undefined,
      OR: orFilters.length > 0 ? orFilters : undefined,
    };

    const items = await this.prismaService.product.findMany({
      where,
      select: { productGid: true },
      take: params.limit,
      orderBy: { updatedAt: "desc" },
    });

    return items.map((item) => item.productGid);
  }

  private buildRuleWriteData(
    dto: CreateRuleDto | UpdateRuleDto,
  ): Prisma.UpsellRuleUncheckedCreateInput | Prisma.UpsellRuleUncheckedUpdateInput {
    const data: Prisma.UpsellRuleUncheckedCreateInput | Prisma.UpsellRuleUncheckedUpdateInput = {};

    if (dto.name !== undefined) {
      data.name = dto.name;
    }
    if (dto.triggerType !== undefined) {
      data.triggerType = dto.triggerType;
    }
    if (dto.sourceProductId !== undefined) {
      data.sourceProductId = dto.sourceProductId ? toProductGid(dto.sourceProductId) : null;
    }
    if (dto.sourceCollectionId !== undefined) {
      data.sourceCollectionId = dto.sourceCollectionId
        ? toCollectionGid(dto.sourceCollectionId)
        : null;
    }
    if (dto.sourceTag !== undefined) {
      data.sourceTag = dto.sourceTag?.trim().toLowerCase() || null;
    }
    if (dto.manualRecommendations !== undefined) {
      data.manualRecommendations = dto.manualRecommendations.map((item) => toProductGid(item));
    }
    if (dto.discountType !== undefined) {
      data.discountType = dto.discountType;
    }
    if (dto.discountValue !== undefined) {
      data.discountValue = dto.discountValue;
    }
    if (dto.isActive !== undefined) {
      data.isActive = dto.isActive;
    }

    return data;
  }

  private serializeRule(rule: {
    id: string;
    name: string;
    triggerType: TriggerType;
    sourceProductId: string | null;
    sourceCollectionId: string | null;
    sourceTag: string | null;
    manualRecommendations: string[];
    discountType: DiscountType;
    discountValue: number;
    isActive: boolean;
  }) {
    return {
      ...rule,
      sourceProductId: parseNumericIdFromGid(rule.sourceProductId) ?? rule.sourceProductId,
      sourceCollectionId:
        parseNumericIdFromGid(rule.sourceCollectionId) ?? rule.sourceCollectionId,
      manualRecommendations: rule.manualRecommendations.map(
        (item) => parseNumericIdFromGid(item) ?? item,
      ),
    };
  }
}
