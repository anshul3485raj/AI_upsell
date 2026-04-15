import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      rawBody?: Buffer;
      shopDomain?: string;
      sessionTokenPayload?: JwtPayload | string;
    }
  }
}

export {};
