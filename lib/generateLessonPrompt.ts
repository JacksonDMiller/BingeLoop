import { LanguageId, LANGUAGES } from "@/languages";

export const generateLessonPrompt = ({
  subtitles,
  nativeLanguage,
  studyLanguage,
}: {
  subtitles: string;
  nativeLanguage: LanguageId;
  studyLanguage: LanguageId;
}) => {
  return `You are generating a structured language-learning lesson from a TV episode subtitle transcript.

The learner is studying ${LANGUAGES[studyLanguage].name}.
Their native language is ${LANGUAGES[nativeLanguage].name}.

Analyze the subtitle transcript and return a COMPLETE JSON object matching the exact schema provided below.

CRITICAL OUTPUT RULES:

* Return ONLY valid JSON
* Do NOT use markdown
* Do NOT use code fences
* Do NOT explain anything
* Do NOT add introductory text
* Do NOT add trailing text
* The response MUST start with {
* The response MUST end with }
* The response MUST be directly parseable using JSON.parse()
* Every required field must exist
* Never omit fields
* Never return null unless explicitly allowed
* If you cannot fully comply, return:
  {"error":"generation_failed"}

IMPORTANT

All explanatory text must be written in ${LANGUAGES[nativeLanguage].name}.

This includes:
- preWatchSummary.nativeLanguage
- shortExplanation
- memoryHint
- partOfSpeech
- grammar names
- grammar explanations
- all nativeLanguage fields

Never use English unless the learner's native language is English.

CONTENT RULES:

* Keep responses concise and natural
* Prioritize spoken conversational language
* Use vocabulary and grammar that actually appears in the subtitles
* Avoid obscure vocabulary unless extremely important
* Grammar explanations should be learner-friendly
* Shadowing lines must come directly from the subtitles
* Keep shadowing lines short
* If romanization is not useful for the language, return ""

LESSON GOALS:

1. preWatchSummary

* Summarize the main emotional conflict and situation
* Help the learner follow the episode before watching
* Keep it concise

2. keyVocabulary

* Select the 10 most useful recurring or important words/phrases
* Prefer:

  * conversational phrases
  * repeated nouns
  * repeated verbs
* Include natural example sentences inspired by the subtitles

3. grammarFocus

* Select the 3 most useful recurring grammar patterns
* Focus on conversational usefulness
* Explain nuance simply

Return EXACTLY this structure:
{
  "preWatchSummary": {
    "nativeLanguage": "",
    "romanized": "",
    "studyLanguage": ""
  },
  "keyVocabulary": [
    {
      "word": {
        "targetLanguage": "",
        "romanized": "",
        "nativeLanguage": ""
      },
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
