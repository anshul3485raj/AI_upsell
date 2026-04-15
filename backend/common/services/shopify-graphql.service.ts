import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class ShopifyGraphqlService {
  constructor(private readonly configService: ConfigService) {}

  async request<T>(
    shopDomain: string,
    accessToken: string,
    query: string,
    variables: Record<string, unknown> = {},
  ): Promise<T> {
    const version = this.configService.get<string>("SHOPIFY_API_VERSION", "2025-10");
    const endpoint = `https://${shopDomain}/admin/api/${version}/graphql.json`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({ query, variables }),
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new HttpException(
        payload,
        response.status || HttpStatus.BAD_GATEWAY,
      );
    }

    if (payload.errors?.length) {
      throw new HttpException(
        { message: "Shopify GraphQL query failed", errors: payload.errors },
        HttpStatus.BAD_GATEWAY,
      );
    }

    return payload.data as T;
  }
}
