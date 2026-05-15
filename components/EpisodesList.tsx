import type { Episode } from "@/types/media";

type EpisodesListProps = {
  episodes: Episode[];
  onSelectEpisode: (episode: Episode) => void;
};

export default function EpisodesList({
  episodes,
  onSelectEpisode,
}: EpisodesListProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-white">Episodes</h3>

      <div className="space-y-2">
        {episodes.map((episode) => (
          <button
            key={episode.id}
            onClick={() => onSelectEpisode(episode)}
            className="flex w-full items-center gap-4 rounded-lg border border-gray-700 p-3 text-left text-white transition hover:border-gray-500 hover:bg-white/5"
          >
            {episode.stillPath && (
              <img
                src={`https://image.tmdb.org/t/p/w185${episode.stillPath}`}
                alt={episode.name}
                className="h-16 w-28 rounded object-cover"
              />
            )}
            <div className="flex-1">
              <div className="font-bold">
                {episode.episodeNumber}. {episode.name}
              </div>
              {episode.overview && (
                <div className="mt-1 line-clamp-2 text-sm text-gray-400">
                  {episode.overview}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
