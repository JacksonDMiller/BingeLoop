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
    <div className="mb-4 grid gap-4 px-4 sm:px-4">
      {results.map((show) => (
        <button
          key={show.id}
          onClick={() => onSelectShow(show)}
          className="group grid w-full grid-cols-[96px_1fr] gap-4 overflow-hidden rounded-[28px] border border-transparent bg-slate-950/80 px-4 py-4 text-left transition hover:-translate-y-0.5 hover:border-slate-500 sm:px-4"
        >
          {show.posterPath ? (
            <img
              src={`https://image.tmdb.org/t/p/w200${show.posterPath}`}
              alt={show.name}
              className="h-28 w-20 rounded-2xl object-cover"
            />
          ) : (
            <div className="h-28 w-20 rounded-2xl bg-slate-800" />
          )}

          <div className="flex flex-col justify-between gap-2">
            <div>
              <div className="text-lg font-semibold text-white transition group-hover:text-orange-400">
                {show.name}
              </div>
              {show.firstAirDate && (
                <div className="mt-1 text-sm text-slate-500">
                  {show.firstAirDate}
                </div>
              )}
            </div>
            {show.overview ? (
              <p className="text-sm leading-6 text-slate-400 line-clamp-3">
                {show.overview}
              </p>
            ) : null}
          </div>
        </button>
      ))}
    </div>
  );
}
