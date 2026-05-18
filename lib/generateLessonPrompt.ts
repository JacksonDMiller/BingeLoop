export const generateLessonPrompt = ({
  subtitles,
  nativeLanguage,
  studyLanguage,
}: {
  subtitles: string;
  nativeLanguage: string;
  studyLanguage: string;
}) => {
  return `You are generating a structured language-learning lesson from a TV episode subtitle transcript.

Your task is to analyze the subtitle content and return a COMPLETE JSON object matching the exact provided schema.

The learner is studying ${studyLanguage} and their native language is ${nativeLanguage}.

Your goal is to create a short pre-watch study lesson that helps the learner:
- better understand the episode before watching
- recognize important vocabulary while watching
- notice useful grammar patterns
- prepare for spoken listening comprehension

IMPORTANT RULES:
- Return ONLY valid JSON.
- Do NOT include markdown.
- Do NOT include explanations outside the JSON.
- Every required field must exist.
- Never omit fields.
- Keep responses concise and natural.
- Prioritize spoken conversational language over formal textbook language.
- Use vocabulary and grammar that ACTUALLY appear or are strongly represented in the subtitle transcript.
- Avoid obscure vocabulary unless it is extremely important to the episode.
- The output must strictly follow the provided structure.
- If romanization is not useful for the language, return an empty string.
- Shadowing lines must come directly from the subtitles. 
- Keep shadowing lines short.
- Grammar explanations should be learner-friendly, not academic.

LESSON GENERATION GOALS:

1. preWatchSummary
- Summarize the main emotional conflict and situation of the episode.
- Make it easy for the learner to follow the episode before watching.
- Keep it short.

2. keyVocabulary
- Select the 10 MOST USEFUL recurring or important words/phrases from the subtitles.
- Prefer:
  - conversational phrases
  - repeated nouns
  - frequently repeated verbs
- Include natural example sentences inspired by the subtitles.

3. grammarFocus
- Select the 3 MOST USEFUL grammar tructures or sentence patterns repeatedly used in the subtitles
 - Focus on conversational usefulness.
 - Explain nuance simply.

Return EXACTLY this structure:

{
  "preWatchSummary": {
    "nativeLanguage": "",
    "romanized": "",
    "studyLanguage": ""
  },
  "keyVocabulary": [
    {
      "word": "",
      "romanized": "",
      "partOfSpeech": "",
      "shortExplanation": "",
      "memoryHint": "",
      "exampleSentence": {
        "targetLanguage": "",
        "romanized": "",
        "nativeLanguage": ""
      }
    }
  ],
  "grammarFocus": [
    {
      "name": "",
      "pattern": "",
      "meaning": "",
      "usage": "",
      "nuance": "",
      "example": {
        "targetLanguage": "",
        "romanized": "",
        "nativeLanguage": ""
      }
    }
  ],
  "shadowingPractice": [
    {
      "targetLanguage": "",
      "romanized": "",
      "nativeLanguage": ""
    }
  ]
}

Subtitle Transcript:
${subtitles}`;
};
