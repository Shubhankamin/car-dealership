import type { SearchFilters } from "../api/vehicles";

interface Props {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
}

const fields: { key: keyof SearchFilters; label: string; type?: string }[] = [
  { key: "make", label: "Make" },
  { key: "model", label: "Model" },
  { key: "category", label: "Category" },
  { key: "minPrice", label: "Min price", type: "number" },
  { key: "maxPrice", label: "Max price", type: "number" },
];

export default function SearchBar({ filters, onChange }: Props) {
  return (
    <form
      role="search"
      onSubmit={(e) => e.preventDefault()}
      className="grid gap-3 rounded-2xl bg-white p-4 shadow sm:grid-cols-3 lg:grid-cols-6"
    >
      {fields.map(({ key, label, type }) => (
        <label key={key} className="text-xs font-medium text-slate-600">
          {label}
          <input
            type={type ?? "text"}
            min={type === "number" ? 0 : undefined}
            value={filters[key] ?? ""}
            onChange={(e) => onChange({ ...filters, [key]: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </label>
      ))}
      <button
        type="button"
        onClick={() => onChange({})}
        className="self-end rounded-lg border border-slate-300 py-1.5 text-sm hover:bg-slate-50"
      >
        Clear
      </button>
    </form>
  );
}
