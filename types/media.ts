import type { LanguageId } from "@/languages";

export type GenerateLessonRequest = {
  showName: string;
  seasonNumber: number;
  episodeNumber: number;
  originalLanguage?: LanguageId;
  studyLanguage: LanguageId;
  nativeLanguage: LanguageId;
};

export type GenerateLessonResponse = {
  lesson: string;
};

export type Episode = {
  id: number;
  episodeNumber: number;
  name: string;
  airDate?: string;
  overview?: string;
  stillPath?: string | null;
};

export type Show = {
  id: number;
  name: string;
  posterPath: string | null;
  backdropPath?: string | null;
  overview?: string;
  firstAirDate?: string;
  originalLanguage?: LanguageId;
  imdbID?: string;
};

export type Season = {
  seasonNumber: number;
  name: string;
};

export type GenerateVoiceRequest = {
  text: string;
  language: LanguageId;
};
