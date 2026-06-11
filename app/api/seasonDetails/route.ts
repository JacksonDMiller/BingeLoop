import { NextRequest, NextResponse } from "next/server";

const TOKEN = process.env.TMDB_BEARER_TOKEN!;

export async function GET(req: NextRequest) {
  const showId = req.nextUrl.searchParams.get("showId");
  const season = req.nextUrl.searchParams.get("season");
  const language = req.nextUrl.searchParams.get("language") || "en-US";

  if (!showId || !season) {
    return NextResponse.json(
      { error: "Missing showId or season" },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/tv/${showId}/season/${season}?language=${encodeURIComponent(
        language,
      )}`,
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error("TMDB Error:", errorText);

      return NextResponse.json(
        { error: "TMDB request failed" },
        { status: response.status },
      );
    }

    const data = await response.json();

    return NextResponse.json({
      episodes: data.episodes || [],
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Failed to load season details" },
      { status: 500 },
    );
  }
}
