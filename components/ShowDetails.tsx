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
      <div className="overflow-hidden rounded-2xl bg-slate-950/85 shadow-[0_40px_80px_rgba(15,23,42,0.32)]">
        {selectedShow.backdropPath && (
          <div className="relative overflow-hidden">
            <img
              src={`https://image.tmdb.org/t/p/w1280${selectedShow.backdropPath}`}
              alt={selectedShow.name}
              className="h-72 w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
          </div>
        )}

        <div className="space-y-6 p-8">
          <ShowHeader show={selectedShow} />

          <div className="rounded-3xl bg-slate-950/70 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.2)]">
            <SeasonsList
              seasons={seasons}
              selectedSeason={selectedSeason}
              onSelectSeason={onSelectSeason}
              nativeLanguage={nativeLanguage}
            />
          </div>

          {selectedSeason !== null &&
            episodes.length > 0 &&
            !selectedEpisode && (
              <div className="rounded-3xl bg-slate-950/70 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.2)]">
                <EpisodesList
                  episodes={episodes}
                  onSelectEpisode={onSelectEpisode}
                  nativeLanguage={nativeLanguage}
                />
              </div>
            )}

          {selectedEpisode && (
            <div className="rounded-[28px] bg-slate-950/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.2)]">
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
