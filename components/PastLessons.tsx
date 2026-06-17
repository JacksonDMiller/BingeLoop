"use client";

import { SavedLesson } from "@/types/lesson";
import { LANGUAGES, type LanguageId } from "@/languages";
import { translations } from "@/translations";

type PastLessonsProps = {
  lessons: SavedLesson[];
  onSelectLesson: (lesson: SavedLesson) => void;
  onDeleteLesson: (id: string) => void;
  nativeLanguage: LanguageId;
};

export default function PastLessons({
  lessons,
  onSelectLesson,
  onDeleteLesson,
  nativeLanguage,
}: PastLessonsProps) {
  const t = translations[nativeLanguage].searchPage;

  if (lessons.length === 0) {
    return (
      <div className="rounded-[28px] bg-slate-950/80 p-12 text-center shadow-[0_20px_60px_rgba(15,23,42,0.2)]">
        <p className="text-slate-400">{t.noSavedLessons}</p>
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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="mt-2 pl-4 text-3xl font-semibold text-white">{t.recentLessonsTitle}</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {lessons.map((lesson) => {
          const studyLang = LANGUAGES[lesson.studyLanguage as LanguageId];
          const nativeLang = LANGUAGES[lesson.nativeLanguage as LanguageId];

          return (
            <div key={lesson.id} className="p-2">
              <div
                className="group overflow-hidden rounded-[28px] border border-[rgba(148,163,184,0.18)] bg-slate-950/85 shadow-[0_20px_60px_rgba(15,23,42,0.2)] transition hover:-translate-y-1 hover:bg-slate-900/95"
                onClick={() => onSelectLesson(lesson)}
              >
              {lesson.episodeImageUrl ? (
                <img
                  src={lesson.episodeImageUrl}
                  alt={lesson.episodeName}
                  className="h-44 w-full object-cover"
                />
              ) : lesson.showImageUrl ? (
                <img
                  src={lesson.showImageUrl}
                  alt={lesson.showName}
                  className="h-44 w-full object-cover"
                />
              ) : (
                <div className="h-44 w-full bg-slate-900" />
              )}

              <div className="space-y-3 p-5">
                <h3 className="text-xl font-semibold text-white transition group-hover:text-orange-300">
                  {lesson.showName}
                </h3>

                <p className="text-sm text-slate-400">
                  {t.season} {lesson.seasonNumber}, {t.episode} {lesson.episodeNumber}
                </p>

                <p className="text-sm leading-6 text-slate-300">{lesson.episodeName}</p>

                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="inline-flex rounded-full bg-slate-900/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
                    {nativeLang.name}
                  </span>
                  <span className="inline-flex items-center gap-2 text-xs text-slate-500">
                    →
                    <span className="rounded-full bg-orange-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-orange-200">
                      {studyLang.name}
                    </span>
                  </span>
                </div>

                <p className="text-xs text-slate-500">{formatDate(lesson.savedAt)}</p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteLesson(lesson.id);
                }}
                className="w-full bg-slate-950/90 px-5 py-3 text-left text-sm font-semibold text-red-300 transition group-hover:bg-slate-900/95"
              >
                {t.deleteLesson}
              </button>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}
