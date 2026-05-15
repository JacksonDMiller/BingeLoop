import type { Show } from "@/types/media";

type ShowHeaderProps = {
  show: Show;
};

export default function ShowHeader({ show }: ShowHeaderProps) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row">
      {show.posterPath && (
        <img
          src={`https://image.tmdb.org/t/p/w300${show.posterPath}`}
          alt={show.name}
          className="w-32 shrink-0 rounded-xl"
        />
      )}

      <div className="flex-1">
        <h2 className="mb-2 text-3xl font-bold text-white">{show.name}</h2>

        {show.firstAirDate && (
          <div className="mb-3 text-sm text-gray-500">{show.firstAirDate}</div>
        )}

        {show.overview && (
          <p className="leading-relaxed text-gray-300">{show.overview}</p>
        )}
      </div>
    </div>
  );
}
