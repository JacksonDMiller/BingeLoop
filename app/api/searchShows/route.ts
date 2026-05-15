import { NextRequest, NextResponse } from "next/server";
import "dotenv/config";

const TOKEN = process.env.TMDB_BEARER_TOKEN;

///dot env is not working don't know why

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("query");

  if (!query) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/tv?query=${encodeURIComponent(
        query,
      )}`,
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
        },
      },
    );

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
