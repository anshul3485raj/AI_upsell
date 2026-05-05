import { MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CommonModule } from "./common/common.module";
import { DatabaseModule } from "./database/database.module";
import { OAuthCallbackHmacMiddleware, WebhookHmacMiddleware } from "./middleware/hmacValidator";
import { SessionValidatorMiddleware } from "./middleware/sessionValidator";
import { AnalyticsModule } from "./modules/analytics/analytics.module";
import { AuthModule } from "./modules/auth/auth.module";
import { ShopModule } from "./modules/shop/shop.module";
import { UpsellModule } from "./modules/upsell/upsell.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env"],
    }),
    CommonModule,
    DatabaseModule,
    AuthModule,
    ShopModule,
    UpsellModule,
    AnalyticsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(OAuthCallbackHmacMiddleware)
      .forRoutes({ path: "auth/callback", method: RequestMethod.GET });

    consumer
      .apply(WebhookHmacMiddleware)
      .forRoutes({ path: "shop/webhooks", method: RequestMethod.POST });

    consumer.apply(SessionValidatorMiddleware).forRoutes(
      { path: "shop/me", method: RequestMethod.GET },
      { path: "shop/products", method: RequestMethod.GET },
      { path: "shop/token", method: RequestMethod.PUT },
      { path: "upsell/rules", method: RequestMethod.ALL },
      { path: "upsell/rules/:id", method: RequestMethod.ALL },
      { path: "analytics/summary", method: RequestMethod.GET },
      { path: "analytics/events", method: RequestMethod.GET },
    );
  }
}
