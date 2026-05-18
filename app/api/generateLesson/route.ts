import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import type { GenerateLessonRequest } from "@/types/media";
import { generateLessonPrompt } from "@/lib/generateLessonPrompt";
const MAX_SUBTITLE_LENGTH = 12000;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

const OPENSUBTITLES_API_KEY = process.env.OPENSUBTITLES_API_KEY!;

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
    .filter((line) => !/^\[.*\]$/.test(line) && !/^\(.*\)$/.test(line))
    .map((line) => line.replace(/<[^>]*>/g, ""))
    .map((line) => line.replace(/\{\\.*?\}/g, ""))
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter((line) => line.length > 0)
    .join("\n");
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
    } = body;

    if (!showName || !seasonNumber || !episodeNumber) {
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 },
      );
    }

    // SEARCH OPEN SUBTITLES
    const subtitleSearchResponse = await fetch(
      `https://api.opensubtitles.com/api/v1/subtitles?query=${encodeURIComponent(
        showName,
      )}&season_number=${seasonNumber}&episode_number=${episodeNumber}&languages=${originalLanguage}`,
      {
        headers: {
          "Api-Key": OPENSUBTITLES_API_KEY,
        },
      },
    );

    if (!subtitleSearchResponse.ok) {
      const errorText = await subtitleSearchResponse.text();

      console.error("Subtitle search failed:", errorText);

      return NextResponse.json(
        { error: "Subtitle search failed" },
        { status: 500 },
      );
    }

    const subtitleSearchData = await subtitleSearchResponse.json();

    const subtitles = subtitleSearchData.data || [];

    const subtitle = subtitles
      .filter((subtitle: any) => subtitle.attributes.files?.length > 0)
      .sort(
        (a: any, b: any) =>
          (b.attributes.download_count || 0) -
          (a.attributes.download_count || 0),
      )[0];

    console.log(subtitleSearchData.data, "data");

    if (!subtitle) {
      return NextResponse.json(
        { error: "No subtitles found" },
        { status: 404 },
      );
    }

    const fileId = subtitle.attributes.files?.[0]?.file_id;

    if (!fileId) {
      return NextResponse.json(
        { error: "No subtitle file found" },
        { status: 404 },
      );
    }

    // REQUEST DOWNLOAD LINK
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
      const errorText = await downloadResponse.text();

      console.error("Download request failed:", errorText);

      return NextResponse.json(
        { error: "Failed to request subtitle download" },
        { status: 500 },
      );
    }

    const downloadData = await downloadResponse.json();

    const subtitleFileUrl = downloadData.link;

    if (!subtitleFileUrl) {
      return NextResponse.json(
        { error: "No subtitle download URL" },
        { status: 500 },
      );
    }

    // DOWNLOAD SUBTITLE FILE
    const subtitleFileResponse = await fetch(subtitleFileUrl);

    const subtitleText = await subtitleFileResponse.text();

    // SHORTEN FOR GEMINI TOKEN LIMITS

    const parsedSubtitleText = parseSubtitles(subtitleText);

    const shortenedSubtitles = parsedSubtitleText.slice(0, MAX_SUBTITLE_LENGTH);

    console.log(shortenedSubtitles, "subs");

    // GENERATE LESSON
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: generateLessonPrompt({
        subtitles: shortenedSubtitles,
        nativeLanguage: "English",
        studyLanguage,
      }),
    });

    return NextResponse.json({
      lesson: response.text,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Failed to generate lesson" },
      { status: 500 },
    );
  }
}
