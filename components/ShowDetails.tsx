import EpisodeDetails from "@/components/EpisodeDetails";
import EpisodesList from "@/components/EpisodesList";
import SeasonsList from "@/components/SeasonsList";
import ShowHeader from "@/components/ShowHeader";
import type { Episode, Show, Season } from "@/types/media";
import type { Lesson } from "@/types/lesson";
import { LanguageId } from "@/languages";

type ShowDetailsProps = {
  selectedShow: Show;

  seasons: Season[];
  selectedSeason: number | null;

  episodes: Episode[];
  selectedEpisode: Episode | null;

  lesson: Lesson | null;
  loadingLesson: boolean;
  isSavedLesson: boolean;

  onSelectSeason: (seasonNumber: number) => void;

  onSelectEpisode: (episode: Episode) => void;

  onBackToEpisodes: () => void;

  onGenerateLesson: (episode: Episode) => void;

  onNextEpisode: () => void;

  clearLesson: () => void;

  studyLanguage: LanguageId;
  nativeLanguage: LanguageId;
};

export default function ShowDetails({
  selectedShow,

  seasons,
  selectedSeason,

  episodes,
  selectedEpisode,

  lesson,
  loadingLesson,
  isSavedLesson,
  studyLanguage,
  nativeLanguage,

  onSelectSeason,
  onSelectEpisode,
  onBackToEpisodes,
  onGenerateLesson,
  onNextEpisode,
}: ShowDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-gray-800 bg-black/30">
        {/* HERO IMAGE */}
        {selectedShow.backdropPath && (
          <img
            src={`https://image.tmdb.org/t/p/w1280${selectedShow.backdropPath}`}
            alt={selectedShow.name}
            className="max-h-[300px] w-full object-cover"
          />
        )}

        <div className="space-y-6 p-5">
          {/* SHOW INFO */}
          <ShowHeader show={selectedShow} />

          {/* SEASONS */}
          <SeasonsList
            seasons={seasons}
            selectedSeason={selectedSeason}
            onSelectSeason={onSelectSeason}
            nativeLanguage={nativeLanguage}
          />

          {/* EPISODES */}
          {selectedSeason !== null &&
            episodes.length > 0 &&
            !selectedEpisode && (
              <EpisodesList
                episodes={episodes}
                onSelectEpisode={onSelectEpisode}
                nativeLanguage={nativeLanguage}
              />
            )}

          {/* EPISODE DETAILS */}
          {selectedEpisode && (
            <EpisodeDetails
              episode={selectedEpisode}
              lesson={lesson}
              loadingLesson={loadingLesson}
              onBack={onBackToEpisodes}
              onGenerateLesson={() => onGenerateLesson(selectedEpisode)}
              onNextEpisode={onNextEpisode}
              studyLanguage={studyLanguage}
              nativeLanguage={nativeLanguage}
              isSavedLesson={isSavedLesson}
            />
          )}
        </div>
      </div>
    </div>
  );
}
