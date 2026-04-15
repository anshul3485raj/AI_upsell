import { BadRequestException, Controller, Get, Query, Res } from "@nestjs/common";
import { Response } from "express";
import { sanitizeShopDomain } from "../../common/utils/shopify.util";
import { AuthService } from "./auth.service";

type InstallQuery = {
  shop?: string;
  host?: string;
};

type CallbackQuery = {
  shop?: string;
  code?: string;
  state?: string;
  host?: string;
};

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get("install")
  install(@Query() query: InstallQuery, @Res() res: Response): void {
    const shopDomain = sanitizeShopDomain(query.shop ?? "");
    if (!shopDomain) {
      throw new BadRequestException("A valid .myshopify.com shop is required.");
    }

    const state = this.authService.createStateToken();
    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("oauth_state", state, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 5 * 60 * 1000,
    });

    if (query.host) {
      res.cookie("oauth_host", query.host, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        maxAge: 5 * 60 * 1000,
      });
    }

    res.redirect(this.authService.buildInstallUrl(shopDomain, state));
  }

  @Get("callback")
  async callback(@Query() query: CallbackQuery, @Res() res: Response): Promise<void> {
    if (!query.shop || !query.code || !query.state) {
      throw new BadRequestException("Missing OAuth callback parameters.");
    }

    const redirectUrl = await this.authService.handleOAuthCallback({
      shop: query.shop,
      code: query.code,
      state: query.state,
      storedState: res.req.cookies?.oauth_state as string | undefined,
      host: query.host ?? (res.req.cookies?.oauth_host as string | undefined),
    });

    res.clearCookie("oauth_state");
    res.clearCookie("oauth_host");
    res.redirect(redirectUrl);
  }
}
