import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CacheService } from "./services/cache.service";
import { ShopifyGraphqlService } from "./services/shopify-graphql.service";

@Module({
  imports: [ConfigModule],
  providers: [CacheService, ShopifyGraphqlService],
  exports: [CacheService, ShopifyGraphqlService],
})
export class CommonModule {}
