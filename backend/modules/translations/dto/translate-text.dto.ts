import { IsArray, IsOptional, IsString, Length, MaxLength } from "class-validator";

export class TranslateTextDto {
  @IsArray()
  @IsString({ each: true })
  @MaxLength(5000, { each: true })
  texts!: string[];

  @IsString()
  @Length(2, 10)
  targetLanguage!: string;

  @IsOptional()
  @IsString()
  @Length(2, 10)
  sourceLanguage?: string;
}
