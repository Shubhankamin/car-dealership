import { useCallback, useEffect, useState } from "react";
import { searchVehicles, purchaseVehicle } from "../api/vehicles";
import type { SearchFilters } from "../api/vehicles";
import { getErrorMessage } from "../api/client";
import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import VehicleCard from "../components/VehicleCard";
import type { Vehicle } from "../types";

export default function DashboardPage() {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async (f: SearchFilters) => {
    try {
      setVehicles(await searchVehicles(f));
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
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Available vehicles
        </h1>
        <SearchBar filters={filters} onChange={setFilters} />

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
          <p className="text-slate-500">Loading...</p>
        ) : vehicles.length === 0 ? (
          <p className="text-slate-500">No vehicles match your search.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((v) => (
              <VehicleCard
                key={v.id}
                vehicle={v}
                onPurchase={handlePurchase}
                busy={busyId === v.id}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
