import { LanguageId } from "@/languages";
import { translations } from "@/translations";

type SearchBarProps = {
  inputValue: string;
  setInputValue: (value: string) => void;

  setSearchQuery: (value: string) => void;

  selectedShowName?: string | null;

  clearSelection: () => void;

  nativeLanguage: LanguageId;
};

export default function SearchBar({
  inputValue,
  setInputValue,
  setSearchQuery,
  selectedShowName,
  clearSelection,
  nativeLanguage,
}: SearchBarProps) {
  const t = translations[nativeLanguage].searchPage;

  return (
    <div className="flex-1">
      <label
        htmlFor="show-search"
        className="mb-2 block text-sm font-medium text-slate-400"
      >
        {t.watchLabel}
      </label>

      <input
        id="show-search"
        type="text"
        placeholder={t.searchPlaceholder}
        value={inputValue}
        onChange={(e) => {
          const value = e.target.value;

          setInputValue(value);
          setSearchQuery(value);

          // User started typing a different show
          if (selectedShowName && value !== selectedShowName) {
            clearSelection();
          }
        }}
        className="h-12 w-full rounded-2xl border border-transparent bg-slate-950/80 px-5 text-white placeholder:text-slate-500 shadow-[0_20px_50px_rgba(15,23,42,0.18)] transition hover:border-slate-500 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 focus:outline-none focus:backdrop-blur-sm"
      />
    </div>
  );
}
