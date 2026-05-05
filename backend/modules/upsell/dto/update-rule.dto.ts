import { DiscountType, TriggerType } from "@prisma/client";
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from "class-validator";

export class UpdateRuleDto {
  @IsOptional()
  @IsString()
  @Length(2, 120)
  name?: string;

  @IsOptional()
  @IsEnum(TriggerType)
  triggerType?: TriggerType;

  @IsOptional()
  @IsString()
  sourceProductId?: string;

  @IsOptional()
  @IsString()
  sourceCollectionId?: string;

  @IsOptional()
  @IsString()
  sourceTag?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  manualRecommendations?: string[];

  @IsOptional()
  @IsEnum(DiscountType)
  discountType?: DiscountType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100000)
  discountValue?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
