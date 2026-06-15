export type ExampleSentence = {
  targetLanguage: string;
  romanized: string;
  nativeLanguage: string;
};

export type Word = {
  targetLanguage: string;
  romanized: string;
  nativeLanguage: string;
};

export type VocabularyItem = {
  word: Word;
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

export type SavedLesson = {
  id: string;
  lesson: Lesson;
  showName: string;
  showId: number;
  seasonNumber: number;
  episodeNumber: number;
  episodeName: string;
  showImageUrl?: string | null;
  episodeImageUrl?: string | null;
  studyLanguage: string;
  nativeLanguage: string;
  savedAt: number;
};
