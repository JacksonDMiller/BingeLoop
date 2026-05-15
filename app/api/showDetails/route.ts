import { NextRequest, NextResponse } from "next/server";

const TOKEN = process.env.TMDB_BEARER_TOKEN!;

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing show id" }, { status: 400 });
  }

  try {
    const response = await fetch(`https://api.themoviedb.org/3/tv/${id}`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();

      console.error("TMDB Error:", errorText);

      return NextResponse.json(
        { error: "TMDB request failed" },
        { status: response.status },
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Failed to fetch show details" },
      { status: 500 },
    );
  }
}
