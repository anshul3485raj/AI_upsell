import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { PrismaService } from "../database/prisma.service";
import { sanitizeShopDomain } from "../common/utils/shopify.util";

@Injectable()
export class SessionValidatorMiddleware implements NestMiddleware {
  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {}

  async use(req: Request, _res: Response, next: NextFunction): Promise<void> {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing session token.");
    }

    const token = authHeader.replace("Bearer ", "").trim();
    const apiSecret = this.configService.get<string>("SHOPIFY_API_SECRET", "");
    const apiKey = this.configService.get<string>("SHOPIFY_API_KEY", "");

    try {
      const payload = jwt.verify(token, apiSecret, {
        algorithms: ["HS256"],
        audience: apiKey,
      }) as JwtPayload;

      const destination = typeof payload.dest === "string" ? payload.dest : "";
      const url = new URL(destination);
      const shopDomain = sanitizeShopDomain(url.hostname);

      if (!shopDomain) {
        throw new UnauthorizedException("Session token destination is invalid.");
      }

      const shop = await this.prismaService.shop.findUnique({
        where: { domain: shopDomain },
        select: { id: true },
      });

      if (!shop) {
        throw new UnauthorizedException("Shop is not installed.");
      }

      req.shopDomain = shopDomain;
      req.sessionTokenPayload = payload;
      next();
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException("Invalid or expired session token.");
    }
  }
}
