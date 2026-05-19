export type ExampleSentence = {
  targetLanguage: string;
  romanized: string;
  nativeLanguage: string;
};

export type VocabularyItem = {
  word: string;
  romanized: string;
  partOfSpeech: string;
  shortExplanation: string;
  memoryHint: string;
  exampleSentence: ExampleSentence;
};

export type GrammarPoint = {
  name: string;
  pattern: string;
  meaning: string;
  usage: string;
  nuance: string;
  example: ExampleSentence;
};

export type ShadowingLine = {
  targetLanguage: string;
  romanized: string;
  nativeLanguage: string;
};

export type Lesson = {
  preWatchSummary: {
    nativeLanguage: string;
    romanized: string;
    studyLanguage: string;
  };

  keyVocabulary: VocabularyItem[];

  grammarFocus: GrammarPoint[];

  shadowingPractice: ShadowingLine[];
};
