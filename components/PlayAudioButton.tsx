"use client";
import { LanguageId } from "@/languages";
import { playVoice } from "@/lib/playVoice";

type PlayAudioButtonProps = {
  text: string;
  language: LanguageId;
};

export function PlayAudioButton({ text, language }: PlayAudioButtonProps) {
  return (
    <button
      onClick={async () => {
        await playVoice({
          text,
          language,
        });
      }}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(148,163,184,0.24)] bg-slate-950/90 text-lg text-orange-300 shadow-[0_10px_30px_rgba(15,23,42,0.25)] transition hover:border-orange-400/40 hover:bg-slate-900 active:scale-95"
    >
      🔊
    </button>
  );
}
