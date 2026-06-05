type LanguageDefinition = {
  name: string;
  nativeName: string;

  codes: {
    iso639_1: string;
    bcp47: string;

    tmdb: string;

    // Common 3-letter subtitle/media codes
    iso639_2: string;
  };
};

export const LANGUAGES = {
  english: {
    name: "English",
    nativeName: "English",

    codes: {
      iso639_1: "en",
      iso639_2: "eng",

      bcp47: "en-US",

      tmdb: "en-US",
    },
  },

  japanese: {
    name: "Japanese",
    nativeName: "日本語",

    codes: {
      iso639_1: "ja",
      iso639_2: "jpn",

      bcp47: "ja-JP",

      tmdb: "ja-JP",
    },
  },

  chinese: {
    name: "Chinese",
    nativeName: "中文",

    codes: {
      iso639_1: "zh",
      iso639_2: "zho",

      // Simplified Chinese default
      bcp47: "zh-CN",

      tmdb: "zh-CN",
    },
  },

  korean: {
    name: "Korean",
    nativeName: "한국어",

    codes: {
      iso639_1: "ko",
      iso639_2: "kor",

      bcp47: "ko-KR",

      tmdb: "ko-KR",
    },
  },

  spanish: {
    name: "Spanish",
    nativeName: "Español",

    codes: {
      iso639_1: "es",
      iso639_2: "spa",

      bcp47: "es-ES",

      tmdb: "es-ES",
    },
  },

  french: {
    name: "French",
    nativeName: "Français",

    codes: {
      iso639_1: "fr",
      iso639_2: "fra",

      bcp47: "fr-FR",

      tmdb: "fr-FR",
    },
  },

  german: {
    name: "German",
    nativeName: "Deutsch",

    codes: {
      iso639_1: "de",
      iso639_2: "deu",

      bcp47: "de-DE",

      tmdb: "de-DE",
    },
  },
} as const satisfies Record<string, LanguageDefinition>;

export type LanguageId = keyof typeof LANGUAGES;

export type Language = (typeof LANGUAGES)[LanguageId];

export function getLanguageById(id: LanguageId) {
  return LANGUAGES[id];
}
