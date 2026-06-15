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
}: EpisodeDetailsProps) {
  console.log(lesson);
  // Use nativeLanguage for UI translations (the language the user understands)
  const t = translations[nativeLanguage].searchPage;

  return (
    <div className="space-y-5">
      <button
        onClick={onBack}
        className="rounded-lg border border-gray-700 px-4 py-2 text-white transition hover:border-gray-500 hover:bg-white/5"
      >
        ← {t.backToEpisodes}
      </button>
      {/* EPISODE IMAGE */}
      {episode.stillPath && (
        <img
          src={`https://image.tmdb.org/t/p/w780${episode.stillPath}`}
          alt={episode.name}
          className="w-full rounded-xl"
        />
      )}
      {/* EPISODE INFO */}
      <div>
        <h3 className="mb-1 text-2xl font-bold text-white">
          {t.episode} {episode.episodeNumber}
        </h3>

        <div className="mb-2 text-lg text-gray-200">{episode.name}</div>

        {episode.airDate && (
          <div className="text-sm text-gray-500">{episode.airDate}</div>
        )}
      </div>
      {/* SYNOPSIS */}
      {episode.overview && (
        <div>
          <h4 className="mb-2 font-bold text-white">{t.synopsis}</h4>

          <p className="leading-relaxed text-gray-300">{episode.overview}</p>
        </div>
      )}
      {/* ACTIONS */}
      {loadingLesson && (
        <div className="rounded-3xl border border-gray-800 bg-white/5 p-4 text-sm text-zinc-300">
          {t.lessonGenerationAdvice}
          <p className="mt-2 font-semibold text-white">{t.loadingLesson}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          onClick={onGenerateLesson}
          disabled={loadingLesson}
          className="flex min-w-[180px] items-center justify-center rounded-xl border border-gray-700 px-4 py-3 text-white transition hover:border-gray-500 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-70"
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

        <button
          onClick={onNextEpisode}
          className="rounded-xl border border-gray-700 px-4 py-3 text-white transition hover:border-gray-500 hover:bg-white/5"
        >
          {t.nextEpisode} →
        </button>
      </div>
      {/* LESSON */}
      {lesson && (
        <LessonDisplay
          lesson={lesson}
          studyLanguage={studyLanguage}
          nativeLanguage={nativeLanguage}
        ></LessonDisplay>
      )}
    </div>
  );
}
