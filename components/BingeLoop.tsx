"use client";

import { useEffect, useState } from "react";
import type {
  GenerateLessonRequest,
  Episode,
  Show,
  Season,
} from "@/types/media";
import SearchBar from "@/components/SearchBar";
import SearchResults from "@/components/SearchResults";
import ShowDetails from "@/components/ShowDetails";
import { Lesson } from "@/types/lesson";
import { LANGUAGES, type LanguageId } from "@/languages";
import { translations } from "@/translations";

// TMDB API Response Types

type TmdbShow = {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  overview?: string;
  first_air_date?: string;
  original_language?: string;
};

type TmdbSeason = {
  season_number: number;
  name: string;
};

type TmdbEpisode = {
  id: number;
  episode_number: number;
  name: string;
  air_date?: string;
  overview?: string;
  still_path?: string | null;
};

type SearchShowsResponse = {
  results: TmdbShow[];
};

type ShowDetailsResponse = {
  seasons: TmdbSeason[];
};

type SeasonDetailsResponse = {
  episodes: TmdbEpisode[];
};

type GenerateLessonResponse = {
  lesson?: Lesson;
};

export function getLanguageIdFromTmdbCode(
  code?: string,
): LanguageId | undefined {
  return Object.entries(LANGUAGES).find(
    ([_, language]) => language.codes.iso639_1 === code,
  )?.[0] as LanguageId | "english";
}

const LANGUAGE_OPTIONS = Object.entries(LANGUAGES);

export default function SearchSubtitles() {
  // SEARCH STATE
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // LEARNING LANGUAGE
  const [studyLanguage, setStudyLanguage] = useState<LanguageId>("japanese");

  // NATIVE LANGUAGE
  const [nativeLanguage, setNativeLanguage] = useState<LanguageId>("english");

  // Get translations based on native language
  const t = translations[nativeLanguage].searchPage;

  // SEARCH RESULTS
  const [results, setResults] = useState<Show[]>([]);

  // SELECTED SHOW
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);

  // SEASONS
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);

  // EPISODES
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);

  // LESSON
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loadingLesson, setLoadingLesson] = useState(false);

  // SEARCH SHOWS
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/searchShows?query=${encodeURIComponent(searchQuery)}`,
        );

        if (!response.ok) {
          console.error("Failed to search shows");
          return;
        }

        const data: SearchShowsResponse = await response.json();

        const normalizedResults: Show[] = data.results.map((show) => ({
          id: show.id,
          name: show.name,
          posterPath: show.poster_path,
          backdropPath: show.backdrop_path,
          overview: show.overview,
          firstAirDate: show.first_air_date,
          originalLanguage: getLanguageIdFromTmdbCode(show.original_language),
        }));

        setResults(normalizedResults);
      } catch (err) {
        console.error(err);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  // SELECT SHOW
  async function selectShow(show: Show) {
    // UPDATE INPUT ONLY
    setInputValue(show.name);

    // CLEAR SEARCH RESULTS
    setResults([]);
    setSearchQuery("");

    // RESET UI STATE
    setSelectedShow(show);
    setSelectedSeason(null);
    setSelectedEpisode(null);

    setSeasons([]);
    setEpisodes([]);

    setLesson(null);

    try {
      const response = await fetch(`/api/showDetails?id=${show.id}`);

      if (!response.ok) {
        console.error("Failed to load show details");
        return;
      }

      const data: ShowDetailsResponse = await response.json();

      const filteredSeasons: Season[] = data.seasons
        .filter((season) => season.season_number > 0)
        .map((season) => ({
          seasonNumber: season.season_number,
          name: season.name,
        }));

      setSeasons(filteredSeasons);
    } catch (err) {
      console.error(err);
    }
  }

  // SELECT SEASON
  async function selectSeason(seasonNumber: number) {
    if (!selectedShow) return;

    setSelectedSeason(seasonNumber);
    setSelectedEpisode(null);

    setLesson(null);

    try {
      const response = await fetch(
        `/api/seasonDetails?showId=${selectedShow.id}&season=${seasonNumber}`,
      );

      if (!response.ok) {
        console.error("Failed to load episodes");
        return;
      }

      const data: SeasonDetailsResponse = await response.json();

      const normalizedEpisodes: Episode[] = data.episodes.map((episode) => ({
        id: episode.id,
        episodeNumber: episode.episode_number,
        name: episode.name,
        airDate: episode.air_date,
        overview: episode.overview,
        stillPath: episode.still_path,
      }));

      setEpisodes(normalizedEpisodes);
    } catch (err) {
      console.error(err);
    }
  }

  // GENERATE LESSON
  async function generateLesson(episode: Episode) {
    if (!selectedShow || !selectedSeason) return;

    setLoadingLesson(true);
    setLesson(null);

    try {
      const requestBody: GenerateLessonRequest = {
        showName: selectedShow.name,
        seasonNumber: selectedSeason,
        episodeNumber: episode.episodeNumber,
        originalLanguage: selectedShow.originalLanguage,
        studyLanguage,
        nativeLanguage,
      };

      const response = await fetch("/api/generateLesson", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();

        console.error("Failed to generate lesson:", errorText);

        return;
      }

      const data: GenerateLessonResponse = await response.json();

      setLesson(data.lesson || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLesson(false);
    }
  }

  // NEXT EPISODE
  function goToNextEpisode() {
    if (!selectedEpisode) return;

    const currentIndex = episodes.findIndex(
      (episode) => episode.id === selectedEpisode.id,
    );

    const nextEpisode = episodes[currentIndex + 1];

    if (!nextEpisode) return;

    setSelectedEpisode(nextEpisode);
    setLesson(null);
  }

  return (
    <div className="mx-auto w-full max-w-5xl p-4">
      {/* HEADER */}
      <div className="mb-10 text-center">
        <h1 className="bg-gradient-to-r from-white to-gray-400 bg-clip-text pb-2 text-5xl font-black leading-none tracking-tight text-transparent sm:text-6xl">
          BingeLoop
        </h1>

        <p className="mt-2 text-lg text-gray-400 sm:text-xl">{t.tagline}</p>
      </div>

      {/* TOP BAR */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end">
        <SearchBar
          inputValue={inputValue}
          setInputValue={setInputValue}
          setSearchQuery={setSearchQuery}
          selectedShowName={selectedShow?.name}
          clearSelection={() => {
            setSelectedShow(null);
            setSelectedSeason(null);
            setSelectedEpisode(null);

            setSeasons([]);
            setEpisodes([]);

            setLesson(null);
          }}
          nativeLanguage={nativeLanguage}
        />

        <div className="w-full sm:w-52">
          <label
            htmlFor="study-language"
            className="mb-2 block text-sm font-medium text-gray-400"
          >
            {t.studyLanguageLabel}
          </label>

          <select
            id="study-language"
            value={studyLanguage}
            onChange={(e) => setStudyLanguage(e.target.value as LanguageId)}
            className="h-12 w-full rounded-xl border border-gray-700 bg-black/40 px-4 text-white focus:border-gray-500 focus:outline-none"
          >
            {LANGUAGE_OPTIONS.map(([id, language]) => (
              <option key={id} value={id}>
                {language.name}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full sm:w-52">
          <label
            htmlFor="native-language"
            className="mb-2 block text-sm font-medium text-gray-400"
          >
            {t.nativeLanguageLabel}
          </label>

          <select
            id="native-language"
            value={nativeLanguage}
            onChange={(e) => setNativeLanguage(e.target.value as LanguageId)}
            className="h-12 w-full rounded-xl border border-gray-700 bg-black/40 px-4 text-white focus:border-gray-500 focus:outline-none"
          >
            {LANGUAGE_OPTIONS.map(([id, language]) => (
              <option key={id} value={id}>
                {language.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <SearchResults results={results} onSelectShow={selectShow} />

      {selectedShow && (
        <ShowDetails
          selectedShow={selectedShow}
          seasons={seasons}
          selectedSeason={selectedSeason}
          episodes={episodes}
          selectedEpisode={selectedEpisode}
          lesson={lesson}
          loadingLesson={loadingLesson}
          studyLanguage={studyLanguage}
          nativeLanguage={nativeLanguage}
          onSelectSeason={selectSeason}
          onSelectEpisode={setSelectedEpisode}
          onBackToEpisodes={() => {
            setSelectedEpisode(null);
            setLesson(null);
          }}
          onGenerateLesson={generateLesson}
          onNextEpisode={goToNextEpisode}
          clearLesson={() => setLesson(null)}
        />
      )}
    </div>
  );
}
