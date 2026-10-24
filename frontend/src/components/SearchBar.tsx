import type { FormEvent } from "react";
import type { SearchFilters } from "../api/vehicles";

interface Props {
  filters: SearchFilters;
  categories: string[];
  onChange: (filters: SearchFilters) => void;
  onSearch: () => void;
}

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100";

const textFields: {
  key: keyof SearchFilters;
  label: string;
  placeholder: string;
  type?: string;
}[] = [
  { key: "make", label: "Make", placeholder: "e.g. Toyota" },
  { key: "model", label: "Model", placeholder: "e.g. Camry" },
];

const priceFields: {
  key: keyof SearchFilters;
  label: string;
  placeholder: string;
}[] = [
  { key: "minPrice", label: "Min price", placeholder: "e.g. 10000" },
  { key: "maxPrice", label: "Max price", placeholder: "e.g. 50000" },
];

export default function SearchBar({
  filters,
  categories,
  onChange,
  onSearch,
}: Props) {
  const active = Object.values(filters).some((v) => v && v.trim() !== "");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSearch();
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-[repeat(5,minmax(0,1fr))_auto]"
    >
      {textFields.map(({ key, label, placeholder }) => (
        <label key={key} className="text-xs font-semibold text-slate-600">
          {label}
          <input
            value={filters[key] ?? ""}
            placeholder={placeholder}
            onChange={(e) => onChange({ ...filters, [key]: e.target.value })}
            className={inputClass}
          />
        </label>
      ))}

      <label className="text-xs font-semibold text-slate-600">
        Category
        <select
          value={filters.category ?? ""}
          onChange={(e) => onChange({ ...filters, category: e.target.value })}
          className={inputClass}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      {priceFields.map(({ key, label, placeholder }) => (
        <label key={key} className="text-xs font-semibold text-slate-600">
          {label}
          <input
            type="number"
            min={0}
            value={filters[key] ?? ""}
            placeholder={placeholder}
            onChange={(e) => onChange({ ...filters, [key]: e.target.value })}
            className={inputClass}
          />
        </label>
      ))}

      <div className="flex items-end gap-2">
        <button
          type="submit"
          className="flex-1 rounded-xl bg-indigo-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          Search
        </button>
        {active && (
          <button
            type="button"
            onClick={() => onChange({})}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
          >
            Clear
          </button>
        )}
      </div>
    </form>
  );
}
