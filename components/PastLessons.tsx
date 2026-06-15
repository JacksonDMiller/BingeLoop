"use client";

import { SavedLesson } from "@/types/lesson";
import { LANGUAGES, type LanguageId } from "@/languages";
import { translations } from "@/translations";

type PastLessonsProps = {
  lessons: SavedLesson[];
  onSelectLesson: (lesson: SavedLesson) => void;
  onDeleteLesson: (id: string) => void;
  onClearHistory: () => void;
  nativeLanguage: LanguageId;
};

export default function PastLessons({
  lessons,
  onSelectLesson,
  onDeleteLesson,
  onClearHistory,
  nativeLanguage,
}: PastLessonsProps) {
  const t = translations[nativeLanguage].searchPage;

  if (lessons.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-400">{t.noSavedLessons}</p>
      </div>
    );
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">{t.recentLessonsTitle}</h2>
        {lessons.length > 0 && (
          <button
            onClick={onClearHistory}
            className="text-sm text-zinc-400 hover:text-zinc-200 transition"
          >
            {t.clearHistory}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lessons.map((lesson) => {
          const studyLang = LANGUAGES[lesson.studyLanguage as LanguageId];
          const nativeLang = LANGUAGES[lesson.nativeLanguage as LanguageId];

          return (
            <div
              key={lesson.id}
              className="overflow-hidden rounded-lg border border-gray-800 bg-white/5 shadow-xl transition hover:bg-white/10 cursor-pointer group"
              onClick={() => onSelectLesson(lesson)}
            >
              {lesson.episodeImageUrl ? (
                <img
                  src={lesson.episodeImageUrl}
                  alt={lesson.episodeName}
                  className="h-40 w-full object-cover"
                />
              ) : lesson.showImageUrl ? (
                <img
                  src={lesson.showImageUrl}
                  alt={lesson.showName}
                  className="h-40 w-full object-cover"
                />
              ) : null}

              <div className="space-y-2 p-4">
                <h3 className="font-semibold text-white group-hover:text-orange-400 transition">
                  {lesson.showName}
                </h3>

                <p className="text-sm text-gray-400">
                  {t.season} {lesson.seasonNumber}, {t.episode} {lesson.episodeNumber}
                </p>

                <p className="text-sm text-gray-300">{lesson.episodeName}</p>

                <div className="flex items-center gap-2 pt-2">
                  <span className="inline-block px-2 py-1 rounded bg-orange-500/20 text-orange-300 text-xs">
                    {studyLang.name}
                  </span>
                  <span className="text-xs text-gray-500">→</span>
                  <span className="inline-block px-2 py-1 rounded bg-blue-500/20 text-blue-300 text-xs">
                    {nativeLang.name}
                  </span>
                </div>

                <p className="text-xs text-gray-500 pt-2">
                  {formatDate(lesson.savedAt)}
                </p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteLesson(lesson.id);
                }}
                className="mt-3 w-full py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition"
              >
                {t.deleteLesson}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
