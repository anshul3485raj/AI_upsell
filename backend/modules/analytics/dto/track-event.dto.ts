import { IsObject, IsOptional, IsString } from "class-validator";

export class TrackEventDto {
  @IsString()
  shop!: string;

  @IsOptional()
  @IsString()
  ruleId?: string;

  @IsOptional()
  @IsString()
  sourceProductId?: string;

  @IsString()
  recommendedProductId!: string;

  @IsOptional()
  @IsString()
  orderGid?: string;

  @IsOptional()
  @IsObject()
  meta?: Record<string, unknown>;
}
