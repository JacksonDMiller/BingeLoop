import textToSpeech from "@google-cloud/text-to-speech";

const client = new textToSpeech.TextToSpeechClient();

export async function POST(req: Request) {
  const { text } = await req.json();

  const [response] = await client.synthesizeSpeech({
    input: {
      text,
    },
    // need to handle multiple languages here
    voice: {
      languageCode: "ja-JP",
      name: "ja-JP-Neural2-B",
    },

    audioConfig: {
      audioEncoding: "MP3",
    },
  });

  const audioBuffer = Buffer.from(response.audioContent as string, "base64");

  return new Response(audioBuffer, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Content-Length": audioBuffer.length.toString(),
    },
  });
}
