import type { Show } from "@/types/media";

type SearchResultsProps = {
  results: Show[];
  onSelectShow: (show: Show) => void;
};

export default function SearchResults({
  results,
  onSelectShow,
}: SearchResultsProps) {
  if (results.length === 0) {
    return null;
  }

  return (
    <div className="mb-8 space-y-3">
      {results.map((show) => (
        <button
          key={show.id}
          onClick={() => onSelectShow(show)}
          className="flex w-full gap-4 rounded-xl border border-gray-800 bg-black/30 p-3 text-left transition hover:border-gray-600 hover:bg-black/50"
        >
          {show.posterPath ? (
            <img
              src={`https://image.tmdb.org/t/p/w200${show.posterPath}`}
              alt={show.name}
              className="w-20 rounded-lg"
            />
          ) : (
            <div className="h-28 w-20 rounded-lg bg-gray-800" />
          )}

          <div>
            <div className="text-lg font-bold text-white">{show.name}</div>

            {show.firstAirDate && (
              <div className="mt-1 text-sm text-gray-500">
                {show.firstAirDate}
              </div>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
