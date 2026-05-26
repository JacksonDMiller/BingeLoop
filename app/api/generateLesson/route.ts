import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

import type { GenerateLessonRequest } from "@/types/media";
import { generateLessonPrompt } from "@/lib/generateLessonPrompt";
import { lookupAniListId } from "@/lib/lookUpAniListId";

const MAX_SUBTITLE_LENGTH = 12000;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

const OPENSUBTITLES_API_KEY = process.env.OPENSUBTITLES_API_KEY!;
const JIMAKU_API_KEY = process.env.JIMAKU_API_KEY!;

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
async function getOpenSubtitles({
  showName,
  seasonNumber,
  episodeNumber,
  originalLanguage,
}: {
  showName: string;
  seasonNumber: number;
  episodeNumber: number;
  originalLanguage?: string;
}) {
  try {
    const params = new URLSearchParams({
      query: showName,
      season_number: String(seasonNumber),
      episode_number: String(episodeNumber),
    });

    if (originalLanguage) {
      params.append("languages", originalLanguage);
    }

    const subtitleSearchResponse = await fetch(
      `https://api.opensubtitles.com/api/v1/subtitles?${params.toString()}`,
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
      console.log("No OpenSubtitles subtitle found");

      return null;
    }

    const fileId = subtitle.attributes?.files?.[0]?.file_id;

    if (!fileId) {
      console.log("No OpenSubtitles file ID found");

      return null;
    }

    /**
     * REQUEST DOWNLOAD LINK
     */
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
      console.log("No subtitle download URL found");

      return null;
    }

    /**
     * DOWNLOAD SUBTITLE FILE
     */
    const subtitleFileResponse = await fetch(subtitleFileUrl);

    if (!subtitleFileResponse.ok) {
      console.error("Failed downloading subtitle file");

      return null;
    }

    return await subtitleFileResponse.text();
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
  seasonNumber,
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
  try {
    const body: GenerateLessonRequest = await req.json();

    const {
      showName,
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

    /**
     * TRY OPENSUBTITLES FIRST
     */
    console.log("Trying OpenSubtitles...");

    subtitleText = await getOpenSubtitles({
      showName,
      seasonNumber,
      episodeNumber,
      originalLanguage,
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
     * GENERATE LESSON
     */
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: generateLessonPrompt({
        subtitles: shortenedSubtitles,
        nativeLanguage,
        studyLanguage,
      }),
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
