type SearchBarProps = {
  inputValue: string;
  setInputValue: (value: string) => void;

  setSearchQuery: (value: string) => void;

  selectedShowName?: string | null;

  clearSelection: () => void;
};

export default function SearchBar({
  inputValue,
  setInputValue,
  setSearchQuery,
  selectedShowName,
  clearSelection,
}: SearchBarProps) {
  return (
    <div className="flex-1">
      <label
        htmlFor="show-search"
        className="mb-2 block text-sm font-medium text-gray-400"
      >
        Watch
      </label>

      <input
        id="show-search"
        type="text"
        placeholder="Search shows..."
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
        className="h-12 w-full rounded-xl border border-gray-700 bg-black/40 px-4 text-white placeholder:text-gray-500 focus:border-gray-500 focus:outline-none"
      />
    </div>
  );
}
