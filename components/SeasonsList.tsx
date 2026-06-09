import type { Season } from "@/types/media";
import { LanguageId } from "@/languages";
import { translations } from "@/translations";

type SeasonsListProps = {
  seasons: Season[];
  selectedSeason: number | null;
  onSelectSeason: (seasonNumber: number) => void;
  nativeLanguage: LanguageId;
};

export default function SeasonsList({
  seasons,
  selectedSeason,
  onSelectSeason,
  nativeLanguage,
}: SeasonsListProps) {
  const t = translations[nativeLanguage].searchPage;

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-white">{t.seasons}</h3>

      <div className="flex flex-wrap gap-2">
        {seasons.map((season) => (
          <button
            key={season.seasonNumber}
            onClick={() => onSelectSeason(season.seasonNumber)}
            className={`rounded-lg border px-4 py-2 transition ${
              selectedSeason === season.seasonNumber
                ? "border-white bg-white text-black"
                : "border-gray-700 text-white hover:border-gray-500 hover:bg-white/5"
            }`}
          >
            {t.season} {season.seasonNumber}
          </button>
        ))}
      </div>
    </div>
  );
}
