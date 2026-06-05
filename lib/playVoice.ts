import type { GenerateVoiceRequest } from "@/types/media";

let currentAudio: HTMLAudioElement | null = null;

let isGeneratingVoice = false;

export async function playVoice(body: GenerateVoiceRequest) {
  if (isGeneratingVoice) {
    return;
  }

  try {
    isGeneratingVoice = true;

    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

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

    currentAudio = audio;

    await new Promise<void>((resolve, reject) => {
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);

        if (currentAudio === audio) {
          currentAudio = null;
        }

        resolve();
      };

      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);

        if (currentAudio === audio) {
          currentAudio = null;
        }

        reject();
      };

      audio.play().catch(reject);
    });
  } finally {
    isGeneratingVoice = false;
  }
}
