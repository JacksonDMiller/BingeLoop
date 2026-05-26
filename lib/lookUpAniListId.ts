type AniListSearchResult = {
  id: number;
  title: {
    romaji?: string;
    english?: string;
    native?: string;
  };
};

export async function lookupAniListId(
  showName: string,
): Promise<AniListSearchResult | null> {
  const query = `
    query ($search: String) {
      Media(search: $search, type: ANIME) {
        id
        title {
          romaji
          english
          native
        }
      }
    }
  `;

  const response = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query,
      variables: {
        search: showName,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`AniList API error: ${response.status}`);
  }

  const json = await response.json();

  return json.data?.Media ?? null;
}
