import textToSpeech from "@google-cloud/text-to-speech";

import { LANGUAGES, type LanguageId } from "@/languages";
import { GenerateVoiceRequest } from "@/types/media";

const client = new textToSpeech.TextToSpeechClient({
  credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS!),
});

const VOICES = {
  english: {
    languageCode: "en-US",
    name: "en-US-Neural2-D",
  },

  japanese: {
    languageCode: "ja-JP",
    name: "ja-JP-Neural2-B",
  },

  chinese: {
    languageCode: "zh-CN",
    name: "cmn-CN-Neural2-A",
  },

  korean: {
    languageCode: "ko-KR",
    name: "ko-KR-Neural2-A",
  },

  spanish: {
    languageCode: "es-ES",
    name: "es-ES-Neural2-B",
  },

  french: {
    languageCode: "fr-FR",
    name: "fr-FR-Neural2-B",
  },

  german: {
    languageCode: "de-DE",
    name: "de-DE-Neural2-B",
  },
} satisfies Record<
  LanguageId,
  {
    languageCode: string;
    name: string;
  }
>;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as GenerateVoiceRequest;

    const text = body.text;
    const language = body.language;

    if (typeof text !== "string" || !text.trim()) {
      return new Response("Missing text", {
        status: 400,
      });
    }

    if (typeof language !== "string" || !(language in LANGUAGES)) {
      return new Response("Invalid language", {
        status: 400,
      });
    }

    const voice = VOICES[language as LanguageId];

    const [response] = await client.synthesizeSpeech({
      input: {
        text,
      },

      voice: {
        languageCode: voice.languageCode,
        name: voice.name,
      },

      audioConfig: {
        audioEncoding: "MP3",
      },
    });

    if (!response.audioContent) {
      return new Response("No audio returned", {
        status: 500,
      });
    }

    const audioBuffer = Buffer.from(response.audioContent);

    return new Response(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error(error);

    return new Response("Failed to generate speech", {
      status: 500,
    });
  }
}
