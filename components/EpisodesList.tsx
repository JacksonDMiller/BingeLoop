import type { Episode } from "@/types/media";
import { LanguageId } from "@/languages";
import { translations } from "@/translations";

type EpisodesListProps = {
  episodes: Episode[];
  onSelectEpisode: (episode: Episode) => void;
  nativeLanguage: LanguageId;
};

export default function EpisodesList({
  episodes,
  onSelectEpisode,
  nativeLanguage,
}: EpisodesListProps) {
  const t = translations[nativeLanguage].searchPage;

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-white">{t.episodes}</h3>

      <div className="space-y-2">
        {episodes.map((episode) => (
          <button
            key={episode.id}
            onClick={() => onSelectEpisode(episode)}
            className="flex w-full items-center gap-4 rounded-lg bg-slate-950/80 p-3 text-left text-white transition hover:bg-slate-900/90"
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
