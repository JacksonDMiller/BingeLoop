import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import type { GenerateLessonRequest } from "@/types/media";

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

    const { showName, seasonNumber, episodeNumber, originalLanguage } = body;

    console.log(originalLanguage, "bob");

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

    console.log(shortenedSubtitles);

    return;
    // GENERATE LESSON
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
You are helping an English speaker prepare to watch anime in Japanese.

The user's goals are:
- improve Japanese listening comprehension
- understand casual spoken Japanese
- prepare BEFORE watching the episode
- slowly build Kanji recognition

The user does NOT comfortably read Kanji yet.

Whenever Japanese is shown:
- ALWAYS include furigana
- Format ALL Japanese like:
  日本語(にほんご)

Never show Kanji without furigana.


Focus heavily on:
- practical listening comprehension
- casual anime dialogue
- contractions and slang
- phrases that are hard to hear quickly
- common spoken Japanese
- useful recurring anime vocabulary

Avoid:
- overly academic explanations
- excessive grammar terminology
- giant walls of text
- obscure vocabulary unless important

Prefer:
- natural English translations
- concise explanations
- practical understanding over literal translation

# Episode Context

Provide a short summary of what seems to be happening in the episode to help the student that will not be understanding all the dialogue.

Generate EXACTLY:

- 15 vocabulary words or phrases
- 5 grammar or casual speech points

Format the response EXACTLY like this:

# Key Vocabulary

For EACH item include:
- Japanese with furigana
- English meaning
- Short nuance/explanation
- Why it may be useful or hard to hear

Example format:

1.
学校(がっこう)
School

Used constantly in slice-of-life anime.
Can sound like "gakkou" very quickly in speech.

# Grammar / Casual Speech Notes

Provide EXACTLY 5 items.

For EACH item include:
- Original Japanese example with furigana
- Natural English meaning
- Short explanation of the grammar/casual speech
- Why it may be difficult to catch while listening

Focus especially on:
- shortened speech
- casual particles
- dropped sounds
- contractions
- sentence endings
- masculine/feminine casual speech
- anime-style informal language


Subtitles:
${shortenedSubtitles}
`,
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
