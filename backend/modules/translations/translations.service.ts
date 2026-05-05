import { Injectable, InternalServerErrorException } from "@nestjs/common";

type GoogleTranslateResponse = [
  Array<Array<string | null | undefined>> | null,
  unknown,
  unknown,
];

@Injectable()
export class TranslationsService {
  private readonly translationCache = new Map<string, string>();

  async translateTexts(
    texts: string[],
    targetLanguage: string,
    sourceLanguage = "en",
  ): Promise<string[]> {
    const normalizedTarget = this.normalizeLanguage(targetLanguage);
    const normalizedSource = this.normalizeLanguage(sourceLanguage);

    if (normalizedTarget === normalizedSource) {
      return texts;
    }

    return Promise.all(
      texts.map(async (text) => {
        const trimmed = text?.trim();
        if (!trimmed) {
          return text;
        }

        const cacheKey = `${normalizedSource}:${normalizedTarget}:${text}`;
        const cached = this.translationCache.get(cacheKey);
        if (cached) {
          return cached;
        }

        const translated = await this.translateSingleText(
          text,
          normalizedSource,
          normalizedTarget,
        );

        this.translationCache.set(cacheKey, translated);
        return translated;
      }),
    );
  }

  private normalizeLanguage(language: string): string {
    return String(language || "en").trim();
  }

  private async translateSingleText(
    text: string,
    sourceLanguage: string,
    targetLanguage: string,
  ): Promise<string> {
    const body = new URLSearchParams({
      client: "gtx",
      sl: sourceLanguage,
      tl: targetLanguage,
      dt: "t",
      q: text,
    });

    const response = await fetch(
      "https://translate.googleapis.com/translate_a/single",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        body: body.toString(),
      },
    );

    if (!response.ok) {
      throw new InternalServerErrorException("Unable to translate the requested text.");
    }

    const payload = (await response.json()) as GoogleTranslateResponse;
    const translatedText = payload?.[0]
      ?.map((segment) => (Array.isArray(segment) ? segment[0] || "" : ""))
      .join("");

    if (!translatedText) {
      throw new InternalServerErrorException("Translation service returned an empty response.");
    }

    return translatedText;
  }
}
