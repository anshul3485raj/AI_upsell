import { Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../database/prisma.service";
import { ShopifyGraphqlService } from "../../common/services/shopify-graphql.service";
import { parseNumericIdFromGid, toProductGid } from "../../common/utils/shopify.util";

type WebhookTopic = "APP_UNINSTALLED" | "ORDERS_CREATE" | "PRODUCTS_UPDATE";

@Injectable()
export class ShopService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly shopifyGraphqlService: ShopifyGraphqlService,
  ) {}

  async upsertShopToken(
    shopDomain: string,
    accessToken: string,
    scopes: string,
  ): Promise<void> {
    await this.prismaService.shop.upsert({
      where: { domain: shopDomain },
      create: {
        domain: shopDomain,
        accessToken,
        scopes,
      },
      update: {
        accessToken,
        scopes,
        installedAt: new Date(),
      },
    });
  }

  async getShopByDomain(shopDomain: string): Promise<{ id: string; domain: string; accessToken: string }> {
    const shop = await this.prismaService.shop.findUnique({
      where: { domain: shopDomain },
      select: {
        id: true,
        domain: true,
        accessToken: true,
      },
    });

    if (!shop) {
      throw new NotFoundException("Shop not found.");
    }

    return shop;
  }

  async getShopProfile(shopDomain: string): Promise<{ domain: string; installedAt: Date }> {
    const shop = await this.prismaService.shop.findUnique({
      where: { domain: shopDomain },
      select: {
        domain: true,
        installedAt: true,
      },
    });

    if (!shop) {
      throw new NotFoundException("Shop not found.");
    }

    return shop;
  }

  async rotateAccessToken(shopDomain: string, accessToken: string): Promise<void> {
    await this.prismaService.shop.update({
      where: { domain: shopDomain },
      data: {
        accessToken,
      },
    });
  }

  async registerMandatoryWebhooks(shopDomain: string): Promise<void> {
    const callbackBase = this.configService.get<string>("APP_URL", "");
    const topics: WebhookTopic[] = ["APP_UNINSTALLED", "ORDERS_CREATE", "PRODUCTS_UPDATE"];

    const shop = await this.getShopByDomain(shopDomain);
    const mutation = `
      mutation registerWebhook($topic: WebhookSubscriptionTopic!, $callbackUrl: URL!) {
        webhookSubscriptionCreate(
          topic: $topic,
          webhookSubscription: {
            callbackUrl: $callbackUrl,
            format: JSON
          }
        ) {
          userErrors {
            field
            message
          }
          webhookSubscription {
            id
          }
        }
      }
    `;

    for (const topic of topics) {
      const data = await this.shopifyGraphqlService.request<{
        webhookSubscriptionCreate: {
          userErrors: Array<{ field: string[] | null; message: string }>;
        };
      }>(
        shop.domain,
        shop.accessToken,
        mutation,
        {
          topic,
          callbackUrl: `${callbackBase}/shop/webhooks`,
        },
      );

      if (data.webhookSubscriptionCreate.userErrors.length > 0) {
        const hasOnlyDuplicateErrors = data.webhookSubscriptionCreate.userErrors.every((item) =>
          item.message.toLowerCase().includes("already"),
        );
        if (!hasOnlyDuplicateErrors) {
          throw new Error(
            `Failed to register ${topic} webhook: ${JSON.stringify(data.webhookSubscriptionCreate.userErrors)}`,
          );
        }
      }
    }
  }

  async handleAppUninstalled(shopDomain: string): Promise<void> {
    await this.prismaService.shop.deleteMany({
      where: { domain: shopDomain },
    });
  }

  async handleOrderCreate(shopDomain: string, payload: Record<string, unknown>): Promise<void> {
    const shop = await this.getShopByDomain(shopDomain);
    const orderGid = String(payload.admin_graphql_api_id ?? "");
    const lineItems = Array.isArray(payload.line_items) ? payload.line_items : [];
    const subtotal = Number(payload.subtotal_price ?? 0);
    const currencyCode = String(payload.currency ?? "");

    if (!orderGid) {
      return;
    }

    await this.prismaService.order.upsert({
      where: {
        shopId_orderGid: {
          shopId: shop.id,
          orderGid,
        },
      },
      create: {
        shopId: shop.id,
        orderGid,
        lineItems,
        subtotal,
        currencyCode,
      },
      update: {
        lineItems,
        subtotal,
        currencyCode,
      },
    });
  }

  async handleProductUpdate(shopDomain: string, payload: Record<string, unknown>): Promise<void> {
    const shop = await this.getShopByDomain(shopDomain);
    const fallbackProductGid = payload.admin_graphql_api_id
      ? String(payload.admin_graphql_api_id)
      : toProductGid(String(payload.id ?? ""));

    if (!fallbackProductGid) {
      return;
    }

    const product = await this.fetchLatestProductData(shop.domain, shop.accessToken, fallbackProductGid);
    if (!product) {
      return;
    }

    await this.prismaService.product.upsert({
      where: {
        shopId_productGid: {
          shopId: shop.id,
          productGid: product.id,
        },
      },
      create: {
        shopId: shop.id,
        productGid: product.id,
        title: product.title,
        handle: product.handle,
        featuredImageUrl: product.featuredImage?.url ?? null,
        minPrice: Number(product.priceRangeV2?.minVariantPrice?.amount ?? 0),
        currencyCode: product.priceRangeV2?.minVariantPrice?.currencyCode ?? null,
        firstVariantGid: product.variants.nodes[0]?.id ?? null,
        tags: product.tags ?? [],
        collectionIds: product.collections.nodes.map((node) => node.id),
        updatedFromShopifyAt: new Date(),
      },
      update: {
        title: product.title,
        handle: product.handle,
        featuredImageUrl: product.featuredImage?.url ?? null,
        minPrice: Number(product.priceRangeV2?.minVariantPrice?.amount ?? 0),
        currencyCode: product.priceRangeV2?.minVariantPrice?.currencyCode ?? null,
        firstVariantGid: product.variants.nodes[0]?.id ?? null,
        tags: product.tags ?? [],
        collectionIds: product.collections.nodes.map((node) => node.id),
        updatedFromShopifyAt: new Date(),
      },
    });
  }

  async ensureProductSnapshot(shopDomain: string, productGid: string): Promise<void> {
    const shop = await this.getShopByDomain(shopDomain);
    const product = await this.fetchLatestProductData(shop.domain, shop.accessToken, productGid);
    if (!product) {
      return;
    }

    await this.prismaService.product.upsert({
      where: {
        shopId_productGid: {
          shopId: shop.id,
          productGid: product.id,
        },
      },
      create: {
        shopId: shop.id,
        productGid: product.id,
        title: product.title,
        handle: product.handle,
        featuredImageUrl: product.featuredImage?.url ?? null,
        minPrice: Number(product.priceRangeV2?.minVariantPrice?.amount ?? 0),
        currencyCode: product.priceRangeV2?.minVariantPrice?.currencyCode ?? null,
        firstVariantGid: product.variants.nodes[0]?.id ?? null,
        tags: product.tags ?? [],
        collectionIds: product.collections.nodes.map((node) => node.id),
        updatedFromShopifyAt: new Date(),
      },
      update: {
        title: product.title,
        handle: product.handle,
        featuredImageUrl: product.featuredImage?.url ?? null,
        minPrice: Number(product.priceRangeV2?.minVariantPrice?.amount ?? 0),
        currencyCode: product.priceRangeV2?.minVariantPrice?.currencyCode ?? null,
        firstVariantGid: product.variants.nodes[0]?.id ?? null,
        tags: product.tags ?? [],
        collectionIds: product.collections.nodes.map((node) => node.id),
        updatedFromShopifyAt: new Date(),
      },
    });
  }

  async fetchProductsByGids(
    shopDomain: string,
    productGids: string[],
  ): Promise<
    Array<{
      id: string;
      title: string;
      handle: string | null;
      featuredImageUrl: string | null;
      price: number;
      currencyCode: string | null;
      variantGid: string | null;
      variantLegacyId: string | null;
    }>
  > {
    if (!productGids.length) {
      return [];
    }

    const shop = await this.getShopByDomain(shopDomain);
    const query = `
      query productsByIds($ids: [ID!]!) {
        nodes(ids: $ids) {
          ... on Product {
            id
            title
            handle
            featuredImage {
              url
            }
            variants(first: 1) {
              nodes {
                id
                price {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    `;

    const data = await this.shopifyGraphqlService.request<{
      nodes: Array<{
        id: string;
        title: string;
        handle: string | null;
        featuredImage?: { url: string } | null;
        variants: {
          nodes: Array<{
            id: string;
            price: {
              amount: string;
              currencyCode: string;
            };
          }>;
        };
      } | null>;
    }>(shop.domain, shop.accessToken, query, { ids: productGids });

    return data.nodes
      .filter((node): node is NonNullable<typeof node> => Boolean(node))
      .map((node) => {
        const firstVariant = node.variants.nodes[0];
        return {
          id: node.id,
          title: node.title,
          handle: node.handle,
          featuredImageUrl: node.featuredImage?.url ?? null,
          price: Number(firstVariant?.price.amount ?? 0),
          currencyCode: firstVariant?.price.currencyCode ?? null,
          variantGid: firstVariant?.id ?? null,
          variantLegacyId: parseNumericIdFromGid(firstVariant?.id ?? null),
        };
      });
  }

  private async fetchLatestProductData(
    shopDomain: string,
    accessToken: string,
    productGid: string,
  ): Promise<{
    id: string;
    title: string;
    handle: string | null;
    tags: string[];
    featuredImage?: { url: string } | null;
    priceRangeV2?: { minVariantPrice?: { amount: string; currencyCode: string } };
    variants: { nodes: Array<{ id: string }> };
    collections: { nodes: Array<{ id: string }> };
  } | null> {
    const query = `
      query productForUpsell($id: ID!) {
        product(id: $id) {
          id
          title
          handle
          tags
          featuredImage {
            url
          }
          variants(first: 1) {
            nodes {
              id
            }
          }
          priceRangeV2 {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          collections(first: 20) {
            nodes {
              id
            }
          }
        }
      }
    `;

    const data = await this.shopifyGraphqlService.request<{
      product: {
        id: string;
        title: string;
        handle: string | null;
        tags: string[];
        featuredImage?: { url: string } | null;
        variants: { nodes: Array<{ id: string }> };
        priceRangeV2?: { minVariantPrice?: { amount: string; currencyCode: string } };
        collections: { nodes: Array<{ id: string }> };
      } | null;
    }>(shopDomain, accessToken, query, { id: productGid });

    return data.product;
  }
}
