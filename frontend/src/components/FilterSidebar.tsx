import type { SearchFilters } from "../api/vehicles";

interface Props {
  filters: SearchFilters;
  categories: string[];
  inStockOnly: boolean;
  onChange: (filters: SearchFilters) => void;
  onInStockChange: (value: boolean) => void;
}

// Quick ranges in rupees. An empty bound means "no limit".
const pricePresets = [
  { label: "Under ₹10L", min: "", max: "1000000" },
  { label: "₹10L – ₹50L", min: "1000000", max: "5000000" },
  { label: "₹50L – ₹1Cr", min: "5000000", max: "10000000" },
  { label: "Above ₹1Cr", min: "10000000", max: "" },
];

const chipClass = (active: boolean) =>
  `rounded-full border px-3.5 py-1.5 text-sm font-medium transition focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-500/20 ${
    active
      ? "border-orange-600 bg-orange-600 text-white shadow-md shadow-orange-600/25"
      : "border-slate-200 bg-white text-slate-600 hover:border-orange-300 hover:text-orange-700"
  }`;

const priceInputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-500/10";

export default function FilterSidebar({
  filters,
  categories,
  inStockOnly,
  onChange,
  onInStockChange,
}: Props) {
  const active =
    inStockOnly ||
    Object.values(filters).some((value) => value && value.trim() !== "");

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_10px_40px_-12px_rgba(15,23,42,0.18)]">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900">Filters</h2>
        {active && (
          <button
            type="button"
            onClick={() => {
              onChange({});
              onInStockChange(false);
            }}
            className="text-sm font-semibold text-orange-600 hover:text-orange-700"
          >
            Clear all
          </button>
        )}
      </div>

      <section className="mt-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Category
        </h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={!filters.category}
            onClick={() => onChange({ ...filters, category: "" })}
            className={chipClass(!filters.category)}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              aria-pressed={filters.category === category}
              onClick={() => onChange({ ...filters, category })}
              className={chipClass(filters.category === category)}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-7 border-t border-slate-100 pt-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Price range
        </h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {pricePresets.map(({ label, min, max }) => {
            const selected =
              (filters.minPrice ?? "") === min &&
              (filters.maxPrice ?? "") === max;
            return (
              <button
                key={label}
                type="button"
                aria-pressed={selected}
                onClick={() =>
                  onChange({ ...filters, minPrice: min, maxPrice: max })
                }
                className={chipClass(selected)}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <input
            type="number"
            min={0}
            aria-label="Minimum price"
            placeholder="Min ₹"
            value={filters.minPrice ?? ""}
            onChange={(e) => onChange({ ...filters, minPrice: e.target.value })}
            className={priceInputClass}
          />
          <span className="text-slate-300">–</span>
          <input
            type="number"
            min={0}
            aria-label="Maximum price"
            placeholder="Max ₹"
            value={filters.maxPrice ?? ""}
            onChange={(e) => onChange({ ...filters, maxPrice: e.target.value })}
            className={priceInputClass}
          />
        </div>
      </section>

      <section className="mt-7 border-t border-slate-100 pt-6">
        <label className="flex cursor-pointer items-center justify-between gap-3">
          <span>
            <span className="block text-sm font-semibold text-gray-900">
              In stock only
            </span>
            <span className="block text-xs text-slate-500">
              Hide sold-out vehicles
            </span>
          </span>
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => onInStockChange(e.target.checked)}
            className="peer sr-only"
          />
          {/* Visual switch; the real checkbox above stays accessible. */}
          <span
            aria-hidden="true"
            className="relative h-6 w-11 shrink-0 rounded-full bg-slate-200 transition after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:bg-orange-600 peer-checked:after:translate-x-5 peer-focus-visible:ring-4 peer-focus-visible:ring-orange-500/20"
          />
        </label>
      </section>
    </div>
  );
}
