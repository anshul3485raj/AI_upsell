import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NextFunction, Request, Response } from "express";
import { createHmac, timingSafeEqual } from "crypto";

type QueryValue = string | string[] | undefined;

const compareSafely = (expected: string, received: string): boolean => {
  const expectedBuffer = Buffer.from(expected, "utf8");
  const receivedBuffer = Buffer.from(received, "utf8");
  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }
  return timingSafeEqual(expectedBuffer, receivedBuffer);
};

const toSignedMessage = (query: Record<string, QueryValue>): string => {
  return Object.keys(query)
    .filter((key) => key !== "hmac" && key !== "signature")
    .sort((a, b) => a.localeCompare(b))
    .map((key) => {
      const value = query[key];
      const flattened = Array.isArray(value) ? value.join(",") : value ?? "";
      return `${key}=${flattened}`;
    })
    .join("&");
};

export const isValidOAuthQueryHmac = (
  query: Record<string, QueryValue>,
  secret: string,
): boolean => {
  const hmac = query.hmac;
  if (!hmac || Array.isArray(hmac)) {
    return false;
  }

  const digest = createHmac("sha256", secret)
    .update(toSignedMessage(query))
    .digest("hex");

  return compareSafely(digest, hmac);
};

export const isValidWebhookHmac = (
  rawBody: Buffer,
  receivedHmac: string,
  secret: string,
): boolean => {
  const digest = createHmac("sha256", secret).update(rawBody).digest("base64");
  return compareSafely(digest, receivedHmac);
};

@Injectable()
export class OAuthCallbackHmacMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}

  use(req: Request, _res: Response, next: NextFunction): void {
    const secret = this.configService.get<string>("SHOPIFY_API_SECRET", "");
    if (!secret || !isValidOAuthQueryHmac(req.query as Record<string, QueryValue>, secret)) {
      throw new UnauthorizedException("Invalid OAuth callback HMAC signature.");
    }
    next();
  }
}

@Injectable()
export class WebhookHmacMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}

  use(req: Request, _res: Response, next: NextFunction): void {
    const secret = this.configService.get<string>("SHOPIFY_API_SECRET", "");
    const receivedHmac = req.headers["x-shopify-hmac-sha256"];
    const hmac = Array.isArray(receivedHmac) ? receivedHmac[0] : receivedHmac;

    if (!secret || !hmac || !req.rawBody || !isValidWebhookHmac(req.rawBody, hmac, secret)) {
      throw new UnauthorizedException("Invalid webhook HMAC signature.");
    }
    next();
  }
}
