"use client";

import { Lesson } from "@/types/lesson";
import { useState } from "react";

type Props = {
  lesson: Lesson;
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
      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
        checked
          ? "bg-orange-500 text-white"
          : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
      }`}
    >
      {label}
    </button>
  );
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
    <div className="space-y-1">
      <p className="text-xl leading-relaxed text-white">{target}</p>

      {showRomanized && romanized && (
        <p className="text-sm italic text-zinc-400">{romanized}</p>
      )}

      {showNativeLanguage && nativeLanguage && (
        <p className="text-sm text-zinc-300">{nativeLanguage}</p>
      )}
    </div>
  );
}

export default function LessonDisplay({ lesson }: Props) {
  const [showRomanized, setShowRomanized] = useState(true);
  const [showNativeLanguage, setShowNativeLanguage] = useState(true);

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-10 text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-3 border-b border-zinc-800 bg-black/80 py-4 backdrop-blur">
        <Toggle
          label="Romanized"
          checked={showRomanized}
          onChange={() => setShowRomanized((prev) => !prev)}
        />

        <Toggle
          label="Native Language"
          checked={showNativeLanguage}
          onChange={() => setShowNativeLanguage((prev) => !prev)}
        />
      </div>

      {/* Summary */}
      <section className="space-y-4">
        <div>
          <h2 className="text-3xl font-bold">Pre-Watch Summary</h2>
          <p className="mt-1 text-zinc-400">
            Understand the episode before you watch.
          </p>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-xl">
          <LanguageLine
            target={lesson.preWatchSummary.studyLanguage}
            romanized={lesson.preWatchSummary.romanized}
            nativeLanguage={lesson.preWatchSummary.nativeLanguage}
            showRomanized={showRomanized}
            showNativeLanguage={showNativeLanguage}
          />
        </div>
      </section>

      {/* Vocabulary */}
      <section className="space-y-5">
        <div>
          <h2 className="text-3xl font-bold">Key Vocabulary</h2>
          <p className="mt-1 text-zinc-400">
            Important words and phrases to listen for.
          </p>
        </div>

        <div className="grid gap-5">
          {lesson.keyVocabulary.map((item, index) => (
            <div
              key={index}
              className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-xl"
            >
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-3xl font-bold text-orange-400">
                  {item.word.targetLanguage}
                </h3>
                {/* // need to handle multiple languages here */}
                <button
                  onClick={async () => {
                    const response = await fetch("/api/generateVoice", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        text: item.word.targetLanguage,
                      }),
                    });

                    if (!response.ok) {
                      console.error("TTS request failed");
                      return;
                    }
                    const blob = await response.blob();

                    const audioUrl = URL.createObjectURL(blob);

                    const audio = new Audio(audioUrl);

                    audio.play();
                  }}
                >
                  🔊
                </button>

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

              <div className="mt-4 rounded-2xl bg-zinc-950/70 p-4">
                <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                  Memory Hint
                </p>

                <p className="mt-2 text-zinc-300">{item.memoryHint}</p>
              </div>

              <div className="mt-5 rounded-2xl border border-zinc-800 bg-black/40 p-4">
                <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
                  Example Sentence
                </p>

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
        <div>
          <h2 className="text-3xl font-bold">Grammar Focus</h2>
          <p className="mt-1 text-zinc-400">
            Common sentence patterns from the episode.
          </p>
        </div>

        <div className="grid gap-5">
          {lesson.grammarFocus.map((item, index) => (
            <div
              key={index}
              className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-xl"
            >
              <h3 className="text-2xl font-bold">{item.name}</h3>

              <div className="mt-4 rounded-2xl bg-orange-500/10 p-4">
                <p className="text-sm uppercase tracking-wide text-orange-300">
                  Pattern
                </p>

                <p className="mt-1 text-lg text-orange-200">{item.pattern}</p>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                    Meaning
                  </p>

                  <p className="mt-1 text-zinc-200">{item.meaning}</p>
                </div>

                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                    Usage
                  </p>

                  <p className="mt-1 text-zinc-200">{item.usage}</p>
                </div>

                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                    Nuance
                  </p>

                  <p className="mt-1 text-zinc-200">{item.nuance}</p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-zinc-800 bg-black/40 p-4">
                <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
                  Example
                </p>

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
        <div>
          <h2 className="text-3xl font-bold">Shadowing Practice</h2>
          <p className="mt-1 text-zinc-400">
            Repeat these lines aloud to practice rhythm and pronunciation.
          </p>
        </div>

        <div className="grid gap-4">
          {lesson.shadowingPractice.map((line, index) => (
            <div
              key={index}
              className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-xl"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 font-bold text-white">
                  {index + 1}
                </div>

                <p className="text-sm uppercase tracking-wide text-zinc-500">
                  Shadowing Line
                </p>
              </div>

              <LanguageLine
                target={line.targetLanguage}
                romanized={line.romanized}
                nativeLanguage={line.nativeLanguage}
                showRomanized={showRomanized}
                showNativeLanguage={showNativeLanguage}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
