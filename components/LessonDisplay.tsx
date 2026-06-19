"use client";

import { Lesson } from "@/types/lesson";
import { useEffect, useState } from "react";
import type { GenerateVoiceRequest } from "@/types/media";
import { LanguageId } from "@/languages";
import { PlayAudioButton } from "@/components/PlayAudioButton";
import { translations } from "@/translations";
import { useLocalStorageState } from "@/app/hooks/useLocalStorageState";

type Props = {
  lesson: Lesson;
  studyLanguage: LanguageId;
  nativeLanguage: LanguageId;
  isSavedLesson?: boolean;
};

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      onClick={onChange}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
        checked
          ? "bg-orange-500 text-slate-950 shadow-lg shadow-orange-500/20"
          : "bg-slate-900 text-slate-300 hover:bg-slate-800"
      }`}
    >
      {label}
    </button>
  );
}

async function generateVoice(body: GenerateVoiceRequest) {
  const response = await fetch("/api/generateVoice", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error("Failed to generate voice");
  }

  const blob = await response.blob();

  const audioUrl = URL.createObjectURL(blob);

  const audio = new Audio(audioUrl);

  return new Promise<void>((resolve, reject) => {
    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
      resolve();
    };

    audio.onerror = reject;

    audio.play().catch(reject);
  });
}

function LanguageLine({
  target,
  romanized,
  nativeLanguage,
  showRomanized,
  showNativeLanguage,
}: {
  target: string;
  romanized?: string;
  nativeLanguage?: string;
  showRomanized: boolean;
  showNativeLanguage: boolean;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xl leading-relaxed text-white">{nativeLanguage}</p>

      {showRomanized && romanized && (
        <p className="text-sm italic leading-relaxed text-zinc-400">
          {romanized}
        </p>
      )}

      <p className="pt-1 text-sm leading-relaxed text-zinc-300">{target}</p>
    </div>
  );
}

export default function LessonDisplay({
  lesson,
  studyLanguage,
  nativeLanguage,
  isSavedLesson = false,
}: Props) {
  const [showRomanized, setShowRomanized] = useLocalStorageState(
    "showRomanized",
    true,
  );
  const [showNativeLanguage, setShowNativeLanguage] = useLocalStorageState(
    "showNativeLanguage",
    true,
  );
  const [isVisible, setIsVisible] = useState(false);

  const t = translations[nativeLanguage];
  const lessonT = t.lesson;

  useEffect(() => {
    setIsVisible(false);
    const frame = window.requestAnimationFrame(() => setIsVisible(true));
    return () => window.cancelAnimationFrame(frame);
  }, [lesson]);

  return (
    <div
      className={`mx-auto max-w-5xl space-y-10 px-0 py-10 text-white transition duration-500 ease-out sm:px-6 ${
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
      }`}
    >
      {!isSavedLesson && (
        <div className="flex items-center gap-2 rounded-full bg-orange-500/10 px-4 py-2 text-sm font-semibold text-orange-200 ring-1 ring-orange-500/25 shadow-sm">
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-orange-300 animate-pulse" />
          {lessonT.lessonReady}
        </div>
      )}

      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-3 rounded-3xl bg-slate-950/90 p-4 shadow-[0_20px_50px_rgba(15,23,42,0.25)] backdrop-blur">
        <Toggle
          label={lessonT.romanized}
          checked={showRomanized}
          onChange={() => setShowRomanized((prev) => !prev)}
        />

        <Toggle
          label={lessonT.nativeLanguage}
          checked={showNativeLanguage}
          onChange={() => setShowNativeLanguage((prev) => !prev)}
        />
      </div>

      {/* Summary */}
      <section className="space-y-4">
        <div className="px-4 sm:px-0">
          <h2 className="text-3xl font-bold">
            {lessonT.preWatchSummary.title}
          </h2>
          <p className="mt-1 text-zinc-400">
            {lessonT.preWatchSummary.description}
          </p>
        </div>

        <div className="rounded-[28px] bg-slate-950/80 px-4 py-6 shadow-[0_20px_60px_rgba(15,23,42,0.2)] sm:px-6">
          <LanguageLine
            nativeLanguage={lesson.preWatchSummary.nativeLanguage}
            target={lesson.preWatchSummary.studyLanguage}
            romanized={lesson.preWatchSummary.romanized}
            showRomanized={showRomanized}
            showNativeLanguage={showNativeLanguage}
          />
        </div>
      </section>

      {/* Vocabulary */}
      <section className="space-y-5">
        <div className="px-4 sm:px-0">
          <h2 className="text-3xl font-bold">{lessonT.keyVocabulary.title}</h2>
          <p className="mt-1 text-zinc-400">
            {lessonT.keyVocabulary.description}
          </p>
        </div>

        <div className="grid gap-5">
          {lesson.keyVocabulary.map((item, index) => (
            <div
              key={index}
              className="rounded-3xl bg-zinc-900/60 px-4 py-6 shadow-xl sm:px-6 sm:py-6"
            >
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-3xl font-bold text-orange-400">
                  {item.word.targetLanguage}
                </h3>
                <PlayAudioButton
                  text={item.word.targetLanguage}
                  language={studyLanguage}
                />

                <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs uppercase tracking-wide text-zinc-300">
                  {item.partOfSpeech}
                </span>
              </div>

              {showRomanized && (
                <p className="mt-2 italic text-zinc-400">
                  {item.word.romanized}
                </p>
              )}

              {showNativeLanguage && (
                <p className="mt-2 italic text-zinc-400">
                  {item.word.nativeLanguage}
                </p>
              )}

              <p className="mt-4 text-zinc-200">{item.shortExplanation}</p>

              <div className="mt-4 rounded-2xl bg-zinc-950/70 px-4 py-4 sm:px-4">
                <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                  {lessonT.keyVocabulary.memoryHint}
                </p>

                <p className="mt-2 text-zinc-300">{item.memoryHint}</p>
              </div>

              <div className="mt-5 rounded-2xl bg-black/40 px-4 py-4 sm:px-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                    {lessonT.keyVocabulary.exampleSentence}
                  </p>

                  <PlayAudioButton
                    text={item.exampleSentence.targetLanguage}
                    language={studyLanguage}
                  />
                </div>

                <LanguageLine
                  target={item.exampleSentence.targetLanguage}
                  romanized={item.exampleSentence.romanized}
                  nativeLanguage={item.exampleSentence.nativeLanguage}
                  showRomanized={showRomanized}
                  showNativeLanguage={showNativeLanguage}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Grammar */}
      <section className="space-y-5">
        <div className="px-4 sm:px-0">
          <h2 className="text-3xl font-bold">{lessonT.grammarFocus.title}</h2>
          <p className="mt-1 text-zinc-400">
            {lessonT.grammarFocus.description}
          </p>
        </div>

        <div className="grid gap-5">
          {lesson.grammarFocus.map((item, index) => (
            <div
              key={index}
              className="rounded-3xl bg-zinc-900/60 px-4 py-6 shadow-xl sm:px-6 sm:py-6"
            >
              <h3 className="text-2xl font-bold">{item.name}</h3>

              <div className="mt-4 rounded-2xl bg-orange-500/10 px-4 py-4 sm:px-4">
                <p className="text-sm uppercase tracking-wide text-orange-300">
                  {lessonT.grammarFocus.pattern}
                </p>

                <p className="mt-1 text-lg text-orange-200">{item.pattern}</p>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                    {lessonT.grammarFocus.meaning}
                  </p>

                  <p className="mt-1 text-zinc-200">{item.meaning}</p>
                </div>

                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                    {lessonT.grammarFocus.usage}
                  </p>

                  <p className="mt-1 text-zinc-200">{item.usage}</p>
                </div>

                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                    {lessonT.grammarFocus.nuance}
                  </p>

                  <p className="mt-1 text-zinc-200">{item.nuance}</p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-black/40 px-4 py-4 sm:px-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                    {lessonT.grammarFocus.example}
                  </p>

                  <PlayAudioButton
                    text={item.example.targetLanguage}
                    language={studyLanguage}
                  />
                </div>

                <LanguageLine
                  target={item.example.targetLanguage}
                  romanized={item.example.romanized}
                  nativeLanguage={item.example.nativeLanguage}
                  showRomanized={showRomanized}
                  showNativeLanguage={showNativeLanguage}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Shadowing */}
      <section className="space-y-5">
        <div className="px-4 sm:px-0">
          <h2 className="text-3xl font-semibold text-white">
            {lessonT.shadowingPractice.title}
          </h2>
          <p className="mt-1 text-slate-400">
            {lessonT.shadowingPractice.description}
          </p>
        </div>

        <div className="grid gap-4">
          {lesson.shadowingPractice.map((line, index) => (
            <div
              key={index}
              className="rounded-3xl bg-zinc-900/60 px-4 py-6 shadow-xl sm:px-6 sm:py-6"
            >
              <div className="mb-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-sm font-semibold text-slate-950">
                    {index + 1}
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-500">
                      {lessonT.shadowingPractice.shadowingLine}
                    </p>
                  </div>
                </div>

                <PlayAudioButton
                  text={line.targetLanguage}
                  language={studyLanguage}
                />
              </div>

              <div className="mt-4 rounded-2xl bg-black/40 px-4 py-4 sm:px-4">
                <div className="space-y-1">
                  <p className="text-2xl font-semibold leading-relaxed text-white">
                    {line.targetLanguage}
                  </p>

                  {showNativeLanguage && line.nativeLanguage && (
                    <p className="text-lg leading-relaxed text-zinc-300">
                      {line.nativeLanguage}
                    </p>
                  )}

                  {showRomanized && line.romanized && (
                    <p className="text-sm italic leading-relaxed text-zinc-400">
                      {line.romanized}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
