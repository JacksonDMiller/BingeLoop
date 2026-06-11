import { NextRequest, NextResponse } from "next/server";

const TOKEN = process.env.TMDB_BEARER_TOKEN!;

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("query");
  const language = req.nextUrl.searchParams.get("language") || "en-US";

  if (!query) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/tv?query=${encodeURIComponent(
        query,
      )}&language=${encodeURIComponent(language)}`,
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
      results: data.results || [],
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Failed to search shows" },
      { status: 500 },
    );
  }
}
