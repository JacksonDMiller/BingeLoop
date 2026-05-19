import { Episode } from "@/types/media";
import LessonDisplay from "./LessonDisplay";
import { Lesson } from "@/types/lesson";

type EpisodeDetailsProps = {
  episode: Episode;

  lesson: Lesson | null;
  loadingLesson: boolean;

  onBack: () => void;
  onGenerateLesson: () => void;
  onNextEpisode: () => void;
};

export default function EpisodeDetails({
  episode,
  lesson,
  loadingLesson,
  onBack,
  onGenerateLesson,
  onNextEpisode,
}: EpisodeDetailsProps) {
  console.log(lesson);
  return (
    <div className="space-y-5">
      <button
        onClick={onBack}
        className="rounded-lg border border-gray-700 px-4 py-2 text-white transition hover:border-gray-500 hover:bg-white/5"
      >
        ← Back to Episodes
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
          Episode {episode.episodeNumber}
        </h3>

        <div className="mb-2 text-lg text-gray-200">{episode.name}</div>

        {episode.airDate && (
          <div className="text-sm text-gray-500">{episode.airDate}</div>
        )}
      </div>
      {/* SYNOPSIS */}
      {episode.overview && (
        <div>
          <h4 className="mb-2 font-bold text-white">Synopsis</h4>

          <p className="leading-relaxed text-gray-300">{episode.overview}</p>
        </div>
      )}
      {/* ACTIONS */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onGenerateLesson}
          disabled={loadingLesson}
          className="flex min-w-[180px] items-center justify-center rounded-xl border border-gray-700 px-4 py-3 text-white transition hover:border-gray-500 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loadingLesson ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />

              <span>Generating...</span>
            </div>
          ) : (
            "Generate Lesson"
          )}
        </button>

        <button
          onClick={onNextEpisode}
          className="rounded-xl border border-gray-700 px-4 py-3 text-white transition hover:border-gray-500 hover:bg-white/5"
        >
          Next Episode →
        </button>
      </div>
      {/* LESSON */}
      {lesson && <LessonDisplay lesson={lesson}></LessonDisplay>}
    </div>
  );
}
