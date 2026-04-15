import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { randomBytes } from "crypto";
import { ShopService } from "../shop/shop.service";
import { buildEmbeddedAppRedirect, sanitizeShopDomain } from "../../common/utils/shopify.util";

type AccessTokenResponse = {
  access_token: string;
  scope: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly shopService: ShopService,
  ) {}

  createStateToken(): string {
    return randomBytes(16).toString("hex");
  }

  buildInstallUrl(shopDomain: string, state: string): string {
    const apiKey = this.configService.get<string>("SHOPIFY_API_KEY", "");
    const scopes = this.configService.get<string>(
      "SHOPIFY_SCOPES",
      "read_products,read_orders,write_products",
    );
    const appUrl = this.configService.get<string>("APP_URL", "");

    const redirectUri = `${appUrl}/auth/callback`;
    const installUrl = new URL(`https://${shopDomain}/admin/oauth/authorize`);
    installUrl.searchParams.set("client_id", apiKey);
    installUrl.searchParams.set("scope", scopes);
    installUrl.searchParams.set("redirect_uri", redirectUri);
    installUrl.searchParams.set("state", state);
    return installUrl.toString();
  }

  async handleOAuthCallback(params: {
    shop: string;
    code: string;
    state: string;
    storedState?: string;
    host?: string;
  }): Promise<string> {
    if (!params.storedState || params.storedState !== params.state) {
      throw new UnauthorizedException("Invalid OAuth state.");
    }

    const shopDomain = sanitizeShopDomain(params.shop);
    if (!shopDomain) {
      throw new BadRequestException("Invalid shop domain.");
    }

    const tokenResult = await this.exchangeCodeForAccessToken(shopDomain, params.code);

    await this.shopService.upsertShopToken(
      shopDomain,
      tokenResult.access_token,
      tokenResult.scope,
    );
    await this.shopService.registerMandatoryWebhooks(shopDomain);

    const apiKey = this.configService.get<string>("SHOPIFY_API_KEY", "");
    return buildEmbeddedAppRedirect(shopDomain, apiKey, params.host);
  }

  private async exchangeCodeForAccessToken(
    shopDomain: string,
    code: string,
  ): Promise<AccessTokenResponse> {
    const response = await fetch(`https://${shopDomain}/admin/oauth/access_token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: this.configService.get<string>("SHOPIFY_API_KEY", ""),
        client_secret: this.configService.get<string>("SHOPIFY_API_SECRET", ""),
        code,
      }),
    });

    const payload = (await response.json()) as Partial<AccessTokenResponse>;
    if (!response.ok || !payload.access_token) {
      throw new UnauthorizedException("Failed to exchange OAuth code.");
    }

    return {
      access_token: payload.access_token,
      scope: payload.scope ?? "",
    };
  }
}
