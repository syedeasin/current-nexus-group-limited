import { Search } from "lucide-react";

const STATUSES = [
  { value: "", label: "All statuses" },
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
];

const LOCALES = [
  { value: "", label: "All locales" },
  { value: "EN", label: "English" },
  { value: "FR", label: "French" },
];

const SELECT_CLASS =
  "h-40 rounded-8 border border-neutral-10 bg-surface-2 px-16 text-p4 font-medium uppercase tracking-[1px] text-neutral-4 outline-none transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

export default function DownloadsFilters({
  query,
  status,
  locale,
}: {
  query: string;
  status: string;
  locale: string;
}) {
  return (
    <form
      method="GET"
      className="flex flex-wrap items-center justify-between gap-16 border-b border-neutral-10 bg-white px-24 py-16"
    >
      <div className="flex flex-wrap items-center gap-8">
        <label htmlFor="status" className="sr-only">
          Filter by status
        </label>
        <select id="status" name="status" defaultValue={status} className={SELECT_CLASS}>
          {STATUSES.map((option) => (
            <option key={option.label} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <label htmlFor="locale" className="sr-only">
          Filter by locale
        </label>
        <select id="locale" name="locale" defaultValue={locale} className={SELECT_CLASS}>
          {LOCALES.map((option) => (
            <option key={option.label} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="relative">
        <label htmlFor="download-search" className="sr-only">
          Search downloads by title or file name
        </label>
        <Search
          size={15}
          strokeWidth={1.5}
          aria-hidden="true"
          className="pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 text-neutral-5"
        />
        <input
          id="download-search"
          name="q"
          type="search"
          defaultValue={query}
          placeholder="Search title or file name"
          className="h-40 w-256 rounded-8 border border-neutral-10 bg-surface-2 py-8 pl-36 pr-12 text-p4 font-light text-neutral-1 outline-none transition-colors duration-200 placeholder:text-neutral-5 focus:border-primary focus:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        />
      </div>

      <button
        type="submit"
        className="h-40 rounded-full bg-primary px-24 text-btn-sm font-semibold uppercase tracking-[0.5px] text-white transition-colors duration-200 hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Apply
      </button>
    </form>
  );
}
