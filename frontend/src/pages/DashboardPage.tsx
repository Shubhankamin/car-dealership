import { useCallback, useEffect, useRef, useState } from "react";
import { getErrorMessage } from "../api/client";
import { purchaseVehicle, searchVehicles } from "../api/vehicles";
import type { SearchFilters } from "../api/vehicles";
import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import VehicleCard from "../components/VehicleCard";
import { useFavorites } from "../hooks/useFavorites";
import type { Vehicle } from "../types";

type Toast = {
  id: number;
  message: string;
  detail?: string;
  type: "success" | "error";
};

export default function DashboardPage() {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { isFavorite, toggle } = useFavorites();

  const filtered = Object.values(filters).some(
    (v) => typeof v === "string" && v.trim() !== "",
  );

  const showToast = useCallback(
    (message: string, type: Toast["type"], detail?: string) => {
      if (toastTimer.current) clearTimeout(toastTimer.current);

      setToast({ id: Date.now(), message, detail, type });

      toastTimer.current = setTimeout(() => {
        setToast(null);
        toastTimer.current = null;
      }, 4500);
    },
    [],
  );

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const load = useCallback(async (f: SearchFilters) => {
    try {
      const data = await searchVehicles(f);
      setVehicles(data);
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

  useEffect(() => {
    const timer = setTimeout(() => load(filters), 300);
    return () => clearTimeout(timer);
  }, [filters, load]);

  async function confirmPurchase() {
    const vehicle = selectedVehicle;
    if (!vehicle || busyId) return;

    setBusyId(vehicle.id);
    setError(null);

    try {
      // The backend remains responsible for validating and reducing stock.
      const updated = await purchaseVehicle(vehicle.id);

      setVehicles((list) =>
        list.map((v) => (v.id === updated.id ? updated : v)),
      );

      setSelectedVehicle(null);

      showToast(
        "Purchase successful",
        "success",
        `${updated.make} ${updated.model} inventory has been updated.`,
      );
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      showToast("Purchase unsuccessful", "error", message);

      // Refresh inventory in case another user changed the stock.
      void load(filters);
    } finally {
      setBusyId(null);
    }
  }

  function closeDialog() {
    if (!busyId) setSelectedVehicle(null);
  }

  return (
    <div className="min-h-screen bg-[#f4f7fc] text-slate-900">
      <Navbar />

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {/* Page heading */}
        <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">
              <span className="h-2 w-2 rounded-full bg-orange-500" />
              Dealership inventory
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Find your next ride.
            </h1>
            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Explore our collection and find the right vehicle for you.
            </p>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-orange-600">
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <path
                  d="M3 13l2-6h14l2 6M4 13h16v5H4zM7 18v2m10-2v2M6 10h12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="7.5" cy="15.5" r=".7" fill="currentColor" />
                <circle cx="16.5" cy="15.5" r=".7" fill="currentColor" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight">
                {loading ? "—" : vehicles.length}
              </p>
              <p className="text-xs font-medium text-slate-500">
                {filtered ? "Matching vehicles" : "Available listings"}
              </p>
            </div>
          </div>
        </section>

        {/* Search panel */}
        <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <circle cx="10.5" cy="10.5" r="6.5" />
                <path d="m16 16 4.5 4.5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">Search inventory</h2>
              <p className="text-xs text-slate-500">
                Filter by make, model, category, or budget.
              </p>
            </div>
          </div>

          <SearchBar
            filters={filters}
            categories={categories}
            onChange={setFilters}
            onSearch={() => void load(filters)}
          />
        </section>

        {/* Feedback */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            <span className="font-bold">!</span>
            <div className="min-w-0 flex-1">{error}</div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="font-semibold hover:text-red-950"
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
        )}

        {/* Inventory heading */}
        <section>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                Explore vehicles
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Find a vehicle that matches your needs.
              </p>
            </div>
            {!loading && (
              <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                {vehicles.length} {vehicles.length === 1 ? "result" : "results"}
              </span>
            )}
          </div>

          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }, (_, i) => (
                <div
                  key={i}
                  className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white p-4"
                >
                  <div className="h-40 rounded-xl bg-slate-200" />
                  <div className="mt-5 h-4 w-2/3 rounded bg-slate-200" />
                  <div className="mt-3 h-6 w-1/3 rounded bg-slate-200" />
                  <div className="mt-5 h-10 rounded-lg bg-slate-200" />
                </div>
              ))}
            </div>
          ) : vehicles.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <svg
                  viewBox="0 0 24 24"
                  className="h-7 w-7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  aria-hidden="true"
                >
                  <circle cx="10.5" cy="10.5" r="6.5" />
                  <path d="m16 16 4.5 4.5" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold">No vehicles found</h3>
              <p className="mt-1 text-sm text-slate-500">
                Try changing your filters to see more results.
              </p>
              <button
                type="button"
                onClick={() => setFilters({})}
                className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {vehicles.map((v) => (
                <div
                  key={v.id}
                  className="min-w-0 rounded-2xl transition duration-200 hover:-translate-y-0.5"
                >
                  <VehicleCard
                    vehicle={v}
                    onPurchase={() => setSelectedVehicle(v)}
                    busy={busyId === v.id}
                    favorite={isFavorite(v.id)}
                    onToggleFavorite={toggle}
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Purchase confirmation modal */}
      {selectedVehicle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeDialog();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="purchase-title"
            className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                  Confirm order
                </span>
                <h2
                  id="purchase-title"
                  className="mt-1 text-xl font-bold text-slate-950"
                >
                  Purchase this vehicle?
                </h2>
              </div>
              <button
                type="button"
                onClick={closeDialog}
                disabled={!!busyId}
                aria-label="Close confirmation"
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                ✕
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      aria-hidden="true"
                    >
                      <path
                        d="M3 13l2-6h14l2 6M4 13h16v5H4zM7 18v2m10-2v2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-bold text-slate-900">
                      {selectedVehicle.make} {selectedVehicle.model}
                    </h3>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {selectedVehicle.category}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
                  <span className="text-sm text-slate-500">
                    Available stock
                  </span>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                    In inventory
                  </span>
                </div>
              </div>

              <p className="text-sm leading-6 text-slate-600">
                Please confirm your purchase. One unit will be deducted from the
                vehicle inventory after the purchase succeeds.
              </p>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeDialog}
                  disabled={!!busyId}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void confirmPurchase()}
                  disabled={!!busyId}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busyId === selectedVehicle.id && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  )}
                  {busyId === selectedVehicle.id
                    ? "Processing purchase..."
                    : "Confirm purchase"}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Success and error toast */}
      {toast && (
        <div
          key={toast.id}
          role={toast.type === "error" ? "alert" : "status"}
          aria-live={toast.type === "error" ? "assertive" : "polite"}
          className="fixed bottom-5 right-5 z-[60] w-[calc(100%-2.5rem)] max-w-sm animate-[toast-in_200ms_ease-out] rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl"
        >
          <div className="flex items-start gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                toast.type === "success"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {toast.type === "success" ? (
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  aria-hidden="true"
                >
                  <path
                    d="m5 12 4 4L19 6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <span className="font-bold">!</span>
              )}
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="font-semibold text-slate-900">{toast.message}</p>
              {toast.detail && (
                <p className="mt-1 text-sm leading-5 text-slate-500">
                  {toast.detail}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                if (toastTimer.current) clearTimeout(toastTimer.current);
                toastTimer.current = null;
                setToast(null);
              }}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </div>
          <div
            className={`mt-3 h-1 rounded-full ${
              toast.type === "success" ? "bg-emerald-500" : "bg-red-500"
            }`}
          />
        </div>
      )}

      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
