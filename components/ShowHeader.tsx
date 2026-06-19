import type { Show } from "@/types/media";

type ShowHeaderProps = {
  show: Show;
};

export default function ShowHeader({ show }: ShowHeaderProps) {
  return (
    <div className="flex flex-col gap-6 rounded-[28px] bg-slate-950/80 px-4 py-4 shadow-[0_20px_60px_rgba(15,23,42,0.18)] sm:flex-row sm:px-6">
      {show.posterPath && (
        <img
          src={`https://image.tmdb.org/t/p/w300${show.posterPath}`}
          alt={show.name}
          className="h-40 w-32 flex-none rounded-3xl object-cover"
        />
      )}

      <div className="flex-1">
        <h2 className="text-4xl font-bold text-white">{show.name}</h2>

        {show.firstAirDate && (
          <div className="mt-2 text-sm uppercase tracking-[0.24em] text-slate-500">
            {show.firstAirDate}
          </div>
        )}

        {show.overview && (
          <p className="mt-4 max-w-3xl leading-7 text-slate-300">
            {show.overview}
          </p>
        )}
      </div>
    </div>
  );
}
