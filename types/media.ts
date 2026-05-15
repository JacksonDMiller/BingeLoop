export type GenerateLessonRequest = {
  showName: string;
  seasonNumber: number;
  episodeNumber: number;
  originalLanguage: string | undefined;
  studyLanguage: string;
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
  originalLanguage?: string;
  imdbID?: string;
};

export type Season = {
  seasonNumber: number;
  name: string;
};
