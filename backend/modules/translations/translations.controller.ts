import { Body, Controller, Post } from "@nestjs/common";
import { TranslateTextDto } from "./dto/translate-text.dto";
import { TranslationsService } from "./translations.service";

@Controller("translations")
export class TranslationsController {
  constructor(private readonly translationsService: TranslationsService) {}

  @Post("translate")
  async translate(@Body() dto: TranslateTextDto): Promise<{ translations: string[] }> {
    const translations = await this.translationsService.translateTexts(
      dto.texts,
      dto.targetLanguage,
      dto.sourceLanguage || "en",
    );

    return { translations };
  }
}
