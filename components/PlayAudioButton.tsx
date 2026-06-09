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
      className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-lg transition hover:bg-zinc-700 active:scale-95"
    >
      🔊
    </button>
  );
}
