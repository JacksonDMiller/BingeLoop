import { Episode } from "@/types/media";
import LessonDisplay from "./LessonDisplay";
import { Lesson } from "@/types/lesson";
import { LanguageId } from "@/languages";
import { translations } from "@/translations";

type EpisodeDetailsProps = {
  episode: Episode;

  lesson: Lesson | null;
  loadingLesson: boolean;

  onBack: () => void;
  onGenerateLesson: () => void;
  onNextEpisode: () => void;
  studyLanguage: LanguageId;
  nativeLanguage: LanguageId;
  isSavedLesson: boolean;
};

export default function EpisodeDetails({
  episode,
  lesson,
  loadingLesson,
  onBack,
  onGenerateLesson,
  onNextEpisode,
  studyLanguage,
  nativeLanguage,
  isSavedLesson,
}: EpisodeDetailsProps) {
  console.log(lesson);
  // Use nativeLanguage for UI translations (the language the user understands)
  const t = translations[nativeLanguage].searchPage;

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 rounded-full bg-slate-950/80 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-900"
      >
        ← {t.backToEpisodes}
      </button>

      {episode.stillPath && (
        <img
          src={`https://image.tmdb.org/t/p/w780${episode.stillPath}`}
          alt={episode.name}
          className="w-full rounded-[28px] object-cover"
        />
      )}

      <div className="rounded-[28px] bg-slate-950/80 px-4 py-6 shadow-[0_20px_60px_rgba(15,23,42,0.18)] sm:px-6">
        <div>
          <h3 className="text-3xl font-semibold text-white">
            {t.episode} {episode.episodeNumber}
          </h3>
          <p className="mt-2 text-xl text-slate-200">{episode.name}</p>
          {episode.airDate && (
            <p className="mt-1 text-sm uppercase tracking-[0.24em] text-slate-500">
              {episode.airDate}
            </p>
          )}
        </div>

        {episode.overview && (
          <div className="mt-6 space-y-3">
            <h4 className="text-lg font-semibold text-white">{t.synopsis}</h4>
            <p className="leading-7 text-slate-300">{episode.overview}</p>
          </div>
        )}
      </div>

      {loadingLesson && (
        <div className="rounded-[28px] bg-slate-950/80 px-4 py-5 text-sm text-slate-300 shadow-[0_20px_60px_rgba(15,23,42,0.18)] sm:px-5">
          <p>{t.lessonGenerationAdvice}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {!lesson && (
          <button
            onClick={onGenerateLesson}
            disabled={loadingLesson}
            className="inline-flex min-w-[180px] items-center justify-center rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-orange-500/20 transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loadingLesson ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span>{t.generating}</span>
              </div>
            ) : (
              t.generateLesson
            )}
          </button>
        )}

        <button
          onClick={onNextEpisode}
          className="inline-flex min-w-[180px] items-center justify-center rounded-2xl bg-slate-950/80 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-900"
        >
          {t.nextEpisode} →
        </button>
      </div>

      {lesson && (
        <LessonDisplay
          lesson={lesson}
          studyLanguage={studyLanguage}
          nativeLanguage={nativeLanguage}
          isSavedLesson={isSavedLesson}
        />
      )}
    </div>
  );
}
