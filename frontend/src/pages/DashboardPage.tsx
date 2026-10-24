import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "../api/client";
import { purchaseVehicle, searchVehicles } from "../api/vehicles";
import type { SearchFilters } from "../api/vehicles";
import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import VehicleCard from "../components/VehicleCard";
import { useFavorites } from "../hooks/useFavorites";
import type { Vehicle } from "../types";

export default function DashboardPage() {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const { isFavorite, toggle } = useFavorites();

  const filtered = Object.values(filters).some((v) => v && v.trim() !== "");

  const load = useCallback(async (f: SearchFilters) => {
    try {
      const data = await searchVehicles(f);
      setVehicles(data);
      // Keep every category we have seen so the dropdown never shrinks while filtering.
      setCategories((prev) =>
        Array.from(new Set([...prev, ...data.map((v) => v.category)])).sort(),
      );
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce so we don't call the API on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => load(filters), 300);
    return () => clearTimeout(timer);
  }, [filters, load]);

  async function handlePurchase(id: string) {
    setBusyId(id);
    setNotice(null);
    try {
      const updated = await purchaseVehicle(id);
      setVehicles((list) => list.map((v) => (v.id === id ? updated : v)));
      setNotice(`Purchased ${updated.make} ${updated.model}.`);
    } catch (err) {
      setError(getErrorMessage(err));
      load(filters); // refresh in case stock changed
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Available vehicles
            </h1>
            <p className="text-slate-500">
              Browse our inventory of quality vehicles
            </p>
          </div>
          {!loading && (
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"
                aria-hidden="true"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 16l1.5-5a2 2 0 011.9-1.4h7.2A2 2 0 0117.5 11L19 16M5 16h14M5 16v3m14-3v3" />
                </svg>
              </span>
              <div>
                <p className="text-xl font-extrabold leading-none text-slate-900">
                  {vehicles.length}
                </p>
                <p className="text-xs text-slate-500">
                  {filtered ? "Matching vehicles" : "Total vehicles"}
                </p>
              </div>
            </div>
          )}
        </div>

        <SearchBar
          filters={filters}
          categories={categories}
          onChange={setFilters}
          onSearch={() => load(filters)}
        />

        {notice && (
          <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
            {notice}
          </p>
        )}
        {error && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                className="h-72 animate-pulse rounded-2xl bg-slate-200"
              />
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <p className="text-lg font-semibold text-slate-700">
              No vehicles match your search
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Try clearing a filter.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((v) => (
              <VehicleCard
                key={v.id}
                vehicle={v}
                onPurchase={handlePurchase}
                busy={busyId === v.id}
                favorite={isFavorite(v.id)}
                onToggleFavorite={toggle}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
