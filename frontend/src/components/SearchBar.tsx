import type { FormEvent } from "react";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

/** The large search field at the top of the dashboard. Results filter as you type. */
export default function SearchBar({ value, onChange }: Props) {
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Filtering is already live; submitting just closes the mobile keyboard.
    (e.currentTarget.elements.namedItem("q") as HTMLInputElement).blur();
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="relative mx-auto w-full max-w-2xl"
    >
      <svg
        viewBox="0 0 24 24"
        className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 4.5 4.5" strokeLinecap="round" />
      </svg>

      <input
        name="q"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Search vehicles"
        placeholder="Search make or model…"
        autoComplete="off"
        className="h-14 w-full rounded-full border border-slate-200 bg-white pl-14 pr-36 text-base text-gray-900 shadow-[0_12px_40px_-12px_rgba(15,23,42,0.25)] outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-500/15 sm:h-16 sm:text-lg"
      />

      <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Clear search"
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            ✕
          </button>
        )}
        <button
          type="submit"
          className="h-10 rounded-full bg-orange-600 px-5 text-sm font-semibold text-white shadow-lg shadow-orange-600/30 transition hover:bg-orange-700 sm:h-12 sm:px-6"
        >
          Search
        </button>
      </div>
    </form>
  );
}
