import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

import type { GenerateLessonRequest } from "@/types/media";

import { LANGUAGES, type LanguageId } from "@/languages";

import { generateLessonPrompt } from "@/lib/generateLessonPrompt";
import { lookupAniListId } from "@/lib/lookUpAniListId";

const MAX_SUBTITLE_LENGTH = 12000;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

const OPENSUBTITLES_API_KEY = process.env.OPENSUBTITLES_API_KEY!;

const JIMAKU_API_KEY = process.env.JIMAKU_API_KEY!;

const TMDB_BEARER_TOKEN = process.env.TMDB_BEARER_TOKEN;

/**
 * CLEAN SRT/VTT SUBTITLES
 */
export function parseSubtitles(srt: string) {
  return srt
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .filter((line) => !/^\d+$/.test(line))
    .filter(
      (line) =>
        !/\d{2}:\d{2}:\d{2},\d{3}\s-->\s\d{2}:\d{2}:\d{2},\d{3}/.test(line),
    )
    .filter((line) => !/^\[.*\]$/.test(line))
    .filter((line) => !/^\(.*\)$/.test(line))
    .map((line) => line.replace(/<[^>]*>/g, ""))
    .map((line) => line.replace(/\{\\.*?\}/g, ""))
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter((line) => line.length > 0)
    .join("\n");
}

/**
 * OPEN SUBTITLES
 */
type OpenSubtitlesSearchParams = {
  query?: string;
  tmdbId?: number;
  imdbId?: string;
  seasonNumber: number;
  episodeNumber: number;
  originalLanguage?: LanguageId;
};

async function fetchTmdbShowInfo(showId: number) {
  if (!TMDB_BEARER_TOKEN) {
    return null;
  }

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/tv/${showId}?append_to_response=external_ids`,
      {
        headers: {
          Authorization: `Bearer ${TMDB_BEARER_TOKEN}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      console.error("TMDB show lookup failed:", await response.text());
      return null;
    }

    const data = await response.json();

    return {
      tmdbId: showId,
      name: data.name as string | undefined,
      originalName: data.original_name as string | undefined,
      imdbId: data.external_ids?.imdb_id as string | undefined,
    };
  } catch (error) {
    console.error("TMDB show lookup failed:", error);
    return null;
  }
}

async function getOpenSubtitlesFromSearch(
  params: OpenSubtitlesSearchParams,
) {
  const searchParams = new URLSearchParams({
    season_number: String(params.seasonNumber),
    episode_number: String(params.episodeNumber),
  });

  if (params.query) {
    searchParams.append("query", params.query);
  }

  if (params.tmdbId) {
    searchParams.append("tmdb_id", String(params.tmdbId));
  }

  if (params.imdbId) {
    searchParams.append("imdb_id", params.imdbId);
  }

  if (params.originalLanguage) {
    searchParams.append(
      "languages",
      LANGUAGES[params.originalLanguage].codes.iso639_1,
    );
  }

  const subtitleSearchResponse = await fetch(
    `https://api.opensubtitles.com/api/v1/subtitles?${searchParams.toString()}`,
    {
      headers: {
        "Api-Key": OPENSUBTITLES_API_KEY,
      },
    },
  );

  if (!subtitleSearchResponse.ok) {
    console.error(
      "OpenSubtitles search failed:",
      await subtitleSearchResponse.text(),
    );
    return null;
  }

  const subtitleSearchData = await subtitleSearchResponse.json();
  const subtitles = subtitleSearchData.data || [];

  const subtitle = subtitles
    .filter((subtitle: any) => subtitle.attributes?.files?.length > 0)
    .sort(
      (a: any, b: any) =>
        (b.attributes?.download_count || 0) -
        (a.attributes?.download_count || 0),
    )[0];

  if (!subtitle) {
    return null;
  }

  const fileId = subtitle.attributes?.files?.[0]?.file_id;

  if (!fileId) {
    return null;
  }

  const downloadResponse = await fetch(
    "https://api.opensubtitles.com/api/v1/download",
    {
      method: "POST",
      headers: {
        "Api-Key": OPENSUBTITLES_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        file_id: fileId,
      }),
    },
  );

  if (!downloadResponse.ok) {
    console.error(
      "OpenSubtitles download failed:",
      await downloadResponse.text(),
    );
    return null;
  }

  const downloadData = await downloadResponse.json();
  const subtitleFileUrl = downloadData.link;

  if (!subtitleFileUrl) {
    return null;
  }

  const subtitleFileResponse = await fetch(subtitleFileUrl);

  if (!subtitleFileResponse.ok) {
    console.error("Failed downloading subtitle file");
    return null;
  }

  return await subtitleFileResponse.text();
}

async function getOpenSubtitles({
  showName,
  seasonNumber,
  episodeNumber,
  originalLanguage,
  tmdbId,
  imdbId,
  alternativeNames = [],
}: {
  showName: string;
  seasonNumber: number;
  episodeNumber: number;
  originalLanguage?: LanguageId;
  tmdbId?: number;
  imdbId?: string;
  alternativeNames?: string[];
}) {
  try {
    const trySearch = async (params: OpenSubtitlesSearchParams) => {
      const result = await getOpenSubtitlesFromSearch(params);
      if (result) {
        console.log(
          "Found OpenSubtitles via",
          params.tmdbId ? `tmdb_id=${params.tmdbId}` : params.imdbId ? `imdb_id=${params.imdbId}` : `query=${params.query}`,
        );
      }
      return result;
    };

    if (tmdbId || imdbId) {
      const result = await trySearch({
        tmdbId,
        imdbId,
        seasonNumber,
        episodeNumber,
        originalLanguage,
      });
      if (result) {
        return result;
      }
    }

    const titleCandidates = Array.from(
      new Set([showName, ...alternativeNames].filter(Boolean)),
    );

    for (const query of titleCandidates) {
      const normalizedQuery = query.trim();
      if (!normalizedQuery) continue;

      const result = await trySearch({
        query: normalizedQuery,
        seasonNumber,
        episodeNumber,
        originalLanguage,
      });

      if (result) {
        return result;
      }
    }

    return null;
  } catch (error) {
    console.error("OpenSubtitles failed:", error);
    return null;
  }
}

/**
 * JIMAKU
 *
 * Better for anime subtitles.
 */
async function getJimakuSubtitles({
  showName,
  episodeNumber,
}: {
  showName: string;
  seasonNumber: number;
  episodeNumber: number;
}) {
  try {
    /**
     * LOOKUP ANILIST ID
     */
    const aniListResult = await lookupAniListId(showName);

    if (!aniListResult?.id) {
      console.error("No AniList ID found");

      return null;
    }

    const aniListId = aniListResult.id;

    /**
     * SEARCH JIMAKU ENTRIES
     */
    const searchResponse = await fetch(
      `https://jimaku.cc/api/entries/search?anilist_id=${aniListId}`,
      {
        headers: {
          Authorization: JIMAKU_API_KEY,
        },
      },
    );

    if (!searchResponse.ok) {
      console.error("Jimaku search failed:", await searchResponse.text());

      return null;
    }

    const searchData = await searchResponse.json();

    const jimakuEntry = searchData[0];

    if (!jimakuEntry?.id) {
      console.error("No Jimaku entry found");

      return null;
    }

    /**
     * FETCH FILES
     */
    const filesResponse = await fetch(
      `https://jimaku.cc/api/entries/${jimakuEntry.id}/files`,
      {
        headers: {
          Authorization: JIMAKU_API_KEY,
        },
      },
    );

    if (!filesResponse.ok) {
      console.error("Jimaku files failed:", await filesResponse.text());

      return null;
    }

    const filesData = await filesResponse.json();

    /**
     * FIND MATCHING FILE
     */
    const matchingFile = filesData.find((file: any) => {
      const name = file.name?.toLowerCase() || "";

      const paddedEpisode = String(episodeNumber).padStart(2, "0");

      return (
        name.includes(`e${paddedEpisode}`) ||
        name.includes(`-${paddedEpisode}`) ||
        name.includes(`[${paddedEpisode}]`) ||
        name.includes(` ${paddedEpisode} `) ||
        name.includes(`${episodeNumber}`)
      );
    });

    if (!matchingFile?.url) {
      console.error("No matching subtitle file found");

      return null;
    }

    /**
     * DOWNLOAD SUBTITLE
     */
    const subtitleResponse = await fetch(matchingFile.url);

    if (!subtitleResponse.ok) {
      console.error("Failed downloading Jimaku subtitle");

      return null;
    }

    return await subtitleResponse.text();
  } catch (error) {
    console.error("Jimaku failed:", error);

    return null;
  }
}

export async function POST(req: NextRequest) {
  // For Testing
  // return NextResponse.json({
  //   lesson: JSON.parse(ExampleLesson),
  // });

  try {
    const body: GenerateLessonRequest = await req.json();

    const {
      showName,
      showId,
      seasonNumber,
      episodeNumber,
      originalLanguage,
      studyLanguage,
      nativeLanguage,
    } = body;

    /**
     * VALIDATION
     */
    if (!showName || seasonNumber == null || episodeNumber == null) {
      return NextResponse.json(
        {
          error: "Missing parameters",
        },
        {
          status: 400,
        },
      );
    }

    let subtitleText: string | null = null;
    let tmdbId: number | undefined;
    let imdbId: string | undefined;
    let alternativeNames: string[] = [];

    if (showId) {
      const tmdbInfo = await fetchTmdbShowInfo(showId);
      if (tmdbInfo) {
        tmdbId = tmdbInfo.tmdbId;
        imdbId = tmdbInfo.imdbId;
        alternativeNames = [tmdbInfo.originalName, tmdbInfo.name].filter(
          (name): name is string => Boolean(name && name !== showName),
        );
      }
    }

    /**
     * TRY OPENSUBTITLES FIRST
     */
    console.log("Trying OpenSubtitles...");

    subtitleText = await getOpenSubtitles({
      showName,
      seasonNumber,
      episodeNumber,
      originalLanguage,
      tmdbId,
      imdbId,
      alternativeNames,
    });

    /**
     * FALLBACK TO JIMAKU
     */
    if (!subtitleText) {
      console.log("Falling back to Jimaku...");

      subtitleText = await getJimakuSubtitles({
        showName,
        seasonNumber,
        episodeNumber,
      });
    }

    /**
     * NO SUBTITLES FOUND
     */
    if (!subtitleText) {
      return NextResponse.json(
        {
          error: "No subtitles found from OpenSubtitles or Jimaku",
        },
        {
          status: 404,
        },
      );
    }

    /**
     * CLEAN + SHORTEN SUBTITLES
     */
    const parsedSubtitleText = parseSubtitles(subtitleText);

    const shortenedSubtitles = parsedSubtitleText.slice(0, MAX_SUBTITLE_LENGTH);

    /**
     * CONVERT INTERNAL IDS
     * -> HUMAN READABLE PROMPT VALUES
     */
    const studyLanguageName = studyLanguage;

    const nativeLanguageName = nativeLanguage;

    /**
     * GENERATE LESSON
     */
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",

      contents: generateLessonPrompt({
        subtitles: shortenedSubtitles,
        nativeLanguage: nativeLanguageName,
        studyLanguage: studyLanguageName,
      }),

      config: {
        responseMimeType: "application/json",
      },
    });

    if (!response.text || typeof response.text !== "string") {
      throw new Error("AI response text was empty");
    }

    /**
     * CLEAN JSON RESPONSE
     */
    const cleaned = response.text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    try {
      const parsed = JSON.parse(cleaned);

      return NextResponse.json({
        lesson: parsed,
      });
    } catch (error) {
      console.error("JSON PARSE FAILED");

      console.error(error);

      console.error(cleaned);

      return NextResponse.json(
        {
          error: "AI returned invalid JSON",
        },
        {
          status: 500,
        },
      );
    }
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to generate lesson",
      },
      {
        status: 500,
      },
    );
  }
}

const ExampleLesson = `{
  "preWatchSummary": {
    "nativeLanguage": "In this episode, Goku continues gathering members for the Tournament of Power. He convinces Android 17 to join after helping protect his island. Meanwhile, Gohan undergoes intense special training with Piccolo to regain his true strength, as the fate of their universe hangs in the balance. We also see Bulma giving birth to Bra, leading to a comedic moment where Beerus accidentally reveals the universe-ending stakes of the tournament.",
    "romanized": "",
    "studyLanguage": "悟空は「力の大会」のメンバー集めを進め、17号が島を守るのを手伝った後、彼をチームに誘います。一方、悟飯はピッコロと厳しい特訓を積み、真の力を取り戻そうとします。ブルマがブラを出産する中、ビルス様はうっかり大会の重大な事実を明かしてしまいます。"
  },
  "keyVocabulary": [
    {
      "word": {
        "targetLanguage": "力の大会",
        "romanized": "Chikara no Taikai",
        "nativeLanguage": "Tournament of Power"
      },
      "romanized": "Chikara no Taikai",
      "partOfSpeech": "noun",
      "shortExplanation": "The name of the tournament that is central to the episode's plot.",
      "memoryHint": "力 (chikara) means 'power', 大会 (taikai) means 'tournament'.",
      "exampleSentence": {
        "targetLanguage": "力の大会に 参加するメンバーを集めるため。",
        "romanized": "Chikara no Taikai ni sanka suru menbaa o atsumeru tame.",
        "nativeLanguage": "In order to gather members to participate in the Tournament of Power."
      }
    },
    {
      "word": {
        "targetLanguage": "任せる",
        "romanized": "makaseru",
        "nativeLanguage": "to leave (something to someone), entrust"
      },
      "romanized": "makaseru",
      "partOfSpeech": "verb",
      "shortExplanation": "To delegate a task or responsibility to someone else.",
      "memoryHint": "Think of 'making' someone responsible for a task.",
      "exampleSentence": {
        "targetLanguage": "孫 悟空 後は任せたぞ。",
        "romanized": "Son Gokū ato wa makaseta zo.",
        "nativeLanguage": "Son Goku, I'll leave the rest to you."
      }
    },
    {
      "word": {
        "targetLanguage": "宇宙",
        "romanized": "uchuu",
        "nativeLanguage": "universe, space"
      },
      "romanized": "uchuu",
      "partOfSpeech": "noun",
      "shortExplanation": "Refers to the entire universe or outer space.",
      "memoryHint": "It sounds a bit like 'Ooh, chew!' when you're amazed by the vastness of space.",
      "exampleSentence": {
        "targetLanguage": "宇宙が消滅するということも。",
        "romanized": "Uchuu ga shoumetsu suru to iu koto mo.",
        "nativeLanguage": "Also, the fact that the universe will be erased."
      }
    },
    {
      "word": {
        "targetLanguage": "消滅する",
        "romanized": "shoumetsu suru",
        "nativeLanguage": "to be erased, to vanish, to disappear"
      },
      "romanized": "shoumetsu suru",
      "partOfSpeech": "verb",
      "shortExplanation": "To cease to exist, often completely and permanently. A major threat in the episode.",
      "memoryHint": "消滅 (shoumetsu) means 'disappearance' + する (suru) 'to do'.",
      "exampleSentence": {
        "targetLanguage": "負ければ この宇宙は消滅する。",
        "romanized": "Makeba kono uchuu wa shoumetsu suru.",
        "nativeLanguage": "If we lose, this universe will be erased."
      }
    },
    {
      "word": {
        "targetLanguage": "強くなる",
        "romanized": "tsuyoku naru",
        "nativeLanguage": "to become strong"
      },
      "romanized": "tsuyoku naru",
      "partOfSpeech": "verb phrase",
      "shortExplanation": "To gain strength or power. Gohan's main goal in this episode.",
      "memoryHint": "強い (tsuyoi) is 'strong', なる (naru) is 'to become'.",
      "exampleSentence": {
        "targetLanguage": "僕は もっと強くならなければ いけないんです。",
        "romanized": "Boku wa motto tsuyoku naranakereba ikenain desu.",
        "nativeLanguage": "I have to become even stronger."
      }
    },
    {
      "word": {
        "targetLanguage": "守る",
        "romanized": "mamoru",
        "nativeLanguage": "to protect, to defend"
      },
      "romanized": "mamoru",
      "partOfSpeech": "verb",
      "shortExplanation": "To keep safe from harm or danger. Gohan's motivation.",
      "memoryHint": "Sounds like 'my more' valuable possessions that I need to protect.",
      "exampleSentence": {
        "targetLanguage": "僕が… みんなを守るんだ！",
        "romanized": "Boku ga... minna o mamorun da!",
        "nativeLanguage": "I... I will protect everyone!"
      }
    },
    {
      "word": {
        "targetLanguage": "油断する",
        "romanized": "yudan suru",
        "nativeLanguage": "to be careless, to let one's guard down"
      },
      "romanized": "yudan suru",
      "partOfSpeech": "verb",
      "shortExplanation": "To become negligent or overconfident, leading to mistakes or vulnerability. Piccolo warns Gohan about this.",
      "memoryHint": "油断 (yudan) 'carelessness' + する (suru) 'to do'. Think of 'you done' messed up by being careless.",
      "exampleSentence": {
        "targetLanguage": "絶対に油断するな。",
        "romanized": "Zettai ni yudan suru na.",
        "nativeLanguage": "Never let your guard down."
      }
    },
    {
      "word": {
        "targetLanguage": "参加する",
        "romanized": "sanka suru",
        "nativeLanguage": "to participate, to join"
      },
      "romanized": "sanka suru",
      "partOfSpeech": "verb",
      "shortExplanation": "To take part in an event, competition, or group. Many characters are being recruited to 'participate' in the tournament.",
      "memoryHint": "参加 (sanka) 'participation' + する (suru) 'to do'.",
      "exampleSentence": {
        "targetLanguage": "俺もチームに加わるよ。",
        "romanized": "Ore mo chiimu ni kuwaru yo.",
        "nativeLanguage": "I'll join the team too."
      }
    },
    {
      "word": {
        "targetLanguage": "覚悟はできています",
        "romanized": "Kakugo wa dekiteimasu",
        "nativeLanguage": "I am prepared / I've made up my mind"
      },
      "romanized": "Kakugo wa dekiteimasu",
      "partOfSpeech": "phrase",
      "shortExplanation": "A strong declaration of readiness to face a difficult situation, showing resolve and mental preparation.",
      "memoryHint": "覚悟 (kakugo) means 'resolve/readiness' and できています (dekiteimasu) means 'is done/prepared'.",
      "exampleSentence": {
        "targetLanguage": "覚悟はできています。",
        "romanized": "Kakugo wa dekiteimasu.",
        "nativeLanguage": "I am prepared."
      }
    },
    {
      "word": {
        "targetLanguage": "詰めが甘い",
        "romanized": "tsume ga amai",
        "nativeLanguage": "to be soft in the end, to lack the final push"
      },
      "romanized": "tsume ga amai",
      "partOfSpeech": "idiomatic phrase",
      "shortExplanation": "To be insufficiently thorough or decisive at the crucial moment, often leading to failure or incomplete success. Piccolo criticizes Gohan for this.",
      "memoryHint": "詰め (tsume) literally means 'packing/stuffing', but here refers to the final step or push. 甘い (amai) is 'sweet' or 'lenient'. So, 'lenient in the final step'.",
      "exampleSentence": {
        "targetLanguage": "心が戦士になりきれていない 肝心なところで詰めが甘いのだ！",
        "romanized": "Kokoro ga senshi ni narikireteinai kanjin na tokoro de tsume ga amai noda!",
        "nativeLanguage": "Your heart hasn't become a complete warrior. You're soft at the crucial moment!"
      }
    }
  ],
  "grammarFocus": [
    {
      "name": "Casual Conjunction: ～けんど / ～けど (kendo / kedo)",
      "pattern": "[Clause 1] + けんど / けど + [Clause 2]",
      "meaning": "although, but, however",
      "usage": "This is a very common casual way to connect two clauses, indicating a contrast or a concession. It's softer and more conversational than 'しかし (shikashi)' or 'けれども (keredomo)'.",
      "nuance": "While 'けど' is generally polite enough for most casual situations, 'けんど' can sound even more casual or dialectal (though it's common in anime speech). It's used here to express a mild contrast.",
      "example": {
        "targetLanguage": "ブランクはあったけんど、あいつなりにこの間の全覧試合頑張ってたぞ。",
        "romanized": "Buranku wa attakendo, aitsu nari ni kono aida no zenran shiai ganbatteta zo.",
        "nativeLanguage": "Although he had a blank (period of inactivity), he did his best in the recent exhibition match in his own way."
      }
    },
    {
      "name": "Expressing Expectation/Certainty: ～はずだ (hazu da)",
      "pattern": "[Verb Plain Form / い-adjective Plain Form / な-adjective Stem + な / Noun + の] + はずだ",
      "meaning": "should be, is expected to be, I'm sure that...",
      "usage": "Used to express an expectation or a strong presumption based on some evidence or logic. It suggests a high degree of certainty.",
      "nuance": "This pattern conveys that the speaker believes something 'should' or 'must' be the case, not just a simple guess. It can also imply a slight disappointment if the expectation isn't met.",
      "example": {
        "targetLanguage": "もっとできるはずなんだよなあ。",
        "romanized": "Motto dekiru hazunanda yo naa.",
        "nativeLanguage": "He should be able to do more, you know."
      }
    },
    {
      "name": "Emphasis/Exclusivity: ～ばかり (bakari)",
      "pattern": "[Noun / Verb dictionary form] + ばかり",
      "meaning": "only, nothing but, just (doing)",
      "usage": "Used to emphasize that there is nothing else or only a certain thing/action. It can sometimes carry a negative connotation, implying something is excessive or unproductive.",
      "nuance": "In this episode, it highlights Gohan's singular focus or the lack of progress due to focusing on only one aspect. For example, focusing 'only' on eagerness without substance.",
      "example": {
        "targetLanguage": "気負いばかりが見える。それでは空回りするばかり。",
        "romanized": "Kioi bakari ga mieru. Sore dewa karamawari suru bakari.",
        "nativeLanguage": "Only eagerness is visible. With that, you'll only spin your wheels (get nowhere)."
      }
    }
  ],
  "shadowingPractice": [
    {
      "targetLanguage": "離れるわけにはいかないんだ",
      "romanized": "Hanareru wake ni wa ikanainda",
      "nativeLanguage": "I can't leave (the island)."
    },
    {
      "targetLanguage": "後は任せたぞ",
      "romanized": "Ato wa makaseta zo",
      "nativeLanguage": "I'll leave the rest to you."
    },
    {
      "targetLanguage": "覚悟はできています",
      "romanized": "Kakugo wa dekiteimasu",
      "nativeLanguage": "I am prepared."
    },
    {
      "targetLanguage": "僕は もっと強くならなければ いけないんです",
      "romanized": "Boku wa motto tsuyoku naranakereba ikenain desu",
      "nativeLanguage": "I have to become even stronger."
    },
    {
      "targetLanguage": "勝つことばかりに気を取られれば",
      "romanized": "Katsu koto bakari ni ki o torarereba",
      "nativeLanguage": "If you only focus on winning"
    },
    {
      "targetLanguage": "負ければ この宇宙は消滅する",
      "romanized": "Makeba kono uchuu wa shoumetsu suru",
      "nativeLanguage": "If we lose, this universe will be erased."
    },
    {
      "targetLanguage": "絶対 武器になると思うんです",
      "romanized": "Zettai buki ni naru to omoundesu",
      "nativeLanguage": "I really think it will become a weapon (advantage)."
    }
  ]
}`;
