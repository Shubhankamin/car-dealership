import { useCallback, useEffect, useRef, useState } from "react";
import { getErrorMessage } from "../api/client";
import { purchaseVehicle, searchVehicles } from "../api/vehicles";
import type { SearchFilters } from "../api/vehicles";
import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import FilterSidebar from "../components/FilterSidebar";
import VehicleCard from "../components/VehicleCard";
import Loader from "../components/Loader";
// import { useFavorites } from "../hooks/useFavorites";
import type { Vehicle } from "../types";
import { matchesKeyword } from "../utils/vehicleSearch";

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
  // Keyword and stock filters run in the browser; category and price go to the API.
  const [keyword, setKeyword] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestId = useRef(0);

  // const { isFavorite, toggle } = useFavorites();

  const visible = vehicles.filter(
    (vehicle) =>
      matchesKeyword(vehicle, keyword) && (!inStockOnly || vehicle.quantity > 0),
  );

  const activeFilterCount =
    (filters.category ? 1 : 0) +
    (filters.minPrice || filters.maxPrice ? 1 : 0) +
    (inStockOnly ? 1 : 0);

  function clearAll() {
    setFilters({});
    setKeyword("");
    setInStockOnly(false);
  }

  const showToast = useCallback(
    (message: string, type: Toast["type"], detail?: string) => {
      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
      }

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
      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
      }

      requestId.current += 1;
    };
  }, []);

  const load = useCallback(async (filtersToLoad: SearchFilters) => {
    const currentRequest = ++requestId.current;

    setLoading(true);
    setError(null);

    try {
      const data = await searchVehicles(filtersToLoad);

      if (currentRequest !== requestId.current) return;

      setVehicles(data);
      setCategories((previous) =>
        Array.from(
          new Set([...previous, ...data.map((vehicle) => vehicle.category)]),
        ).sort(),
      );
    } catch (err) {
      if (currentRequest !== requestId.current) return;
      setError(getErrorMessage(err));
    } finally {
      if (currentRequest === requestId.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void load(filters);
    }, 300);

    return () => clearTimeout(timer);
  }, [filters, load]);

  async function confirmPurchase() {
    const vehicle = selectedVehicle;

    if (!vehicle || busyId) return;

    setBusyId(vehicle.id);
    setError(null);

    try {
      // The backend validates the purchase and updates stock.
      const updated = await purchaseVehicle(vehicle.id);

      setVehicles((currentVehicles) =>
        currentVehicles.map((item) =>
          item.id === updated.id ? updated : item,
        ),
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

      void load(filters);
    } finally {
      setBusyId(null);
    }
  }

  function closeDialog() {
    if (!busyId) {
      setSelectedVehicle(null);
    }
  }

  return (
    <div className="min-h-screen text-gray-900">
      <Navbar />

      <main>
        {/* Hero with the centred search */}
        <section className="relative overflow-hidden border-b border-orange-100/60 bg-gradient-to-b from-orange-50 via-white to-transparent">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-orange-200/40 blur-3xl"
          />

          <div className="relative mx-auto max-w-3xl px-4 pb-14 pt-12 text-center sm:px-6 sm:pt-16">
            <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-orange-600 shadow-sm backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
              Dealership inventory
            </span>

            <h1 className="mt-5 text-4xl font-bold tracking-tight text-gray-950 sm:text-5xl">
              Find your next ride.
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-base text-slate-500 sm:text-lg">
              Explore our collection and find the right vehicle for you.
            </p>

            <div className="mt-8">
              <SearchBar value={keyword} onChange={setKeyword} />
            </div>
          </div>
        </section>

        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-8 lg:py-10">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <button
              type="button"
              onClick={() => setShowFilters((open) => !open)}
              aria-expanded={showFilters}
              aria-controls="vehicle-filters"
              className="flex w-full items-center justify-between rounded-2xl border border-slate-100 bg-white px-5 py-3.5 text-sm font-semibold text-gray-900 shadow-[0_10px_40px_-12px_rgba(15,23,42,0.18)] lg:hidden"
            >
              <span className="flex items-center gap-2">
                Filters
                {activeFilterCount > 0 && (
                  <span className="rounded-full bg-orange-600 px-2 py-0.5 text-xs text-white">
                    {activeFilterCount}
                  </span>
                )}
              </span>
              <span aria-hidden="true">{showFilters ? "▲" : "▼"}</span>
            </button>

            <div
              id="vehicle-filters"
              className={`${showFilters ? "mt-3 block" : "hidden"} lg:mt-0 lg:block`}
            >
              <FilterSidebar
                filters={filters}
                categories={categories}
                inStockOnly={inStockOnly}
                onChange={setFilters}
                onInStockChange={setInStockOnly}
              />
            </div>
          </aside>

          <section className="min-w-0 space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-gray-900">
                  Explore vehicles
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Find a vehicle that matches your needs.
                </p>
              </div>

              {!loading && (
                <span className="rounded-full border border-orange-100 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">
                  {visible.length} {visible.length === 1 ? "result" : "results"}
                </span>
              )}
            </div>

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

            {loading ? (
              <Loader message="Loading vehicles..." />
            ) : visible.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-orange-200 bg-white px-5 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
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

                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  No vehicles found
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Try a different search or loosen your filters.
                </p>

                <button
                  type="button"
                  onClick={clearAll}
                  className="mt-5 rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-500/20"
                >
                  Clear search and filters
                </button>
              </div>
            ) : (
              <div className="grid items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {visible.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="min-w-0 rounded-2xl transition duration-200 hover:-translate-y-0.5"
                  >
                    <VehicleCard
                      vehicle={vehicle}
                      onPurchase={() => setSelectedVehicle(vehicle)}
                      busy={busyId === vehicle.id}
                      // favorite={isFavorite(vehicle.id)}
                      // onToggleFavorite={toggle}
                    />
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {selectedVehicle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeDialog();
            }
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
                <span className="text-xs font-bold uppercase tracking-widest text-orange-600">
                  Confirm order
                </span>

                <h2
                  id="purchase-title"
                  className="mt-1 text-xl font-bold text-gray-950"
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
              <div className="rounded-2xl border border-orange-100 bg-orange-50/60 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-orange-600 shadow-sm">
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
                    <h3 className="truncate font-bold text-gray-900">
                      {selectedVehicle.make} {selectedVehicle.model}
                    </h3>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {selectedVehicle.category}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-orange-100 pt-4">
                  <span className="text-sm text-slate-500">
                    Available stock
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      selectedVehicle.quantity > 0
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {selectedVehicle.quantity > 0
                      ? `${selectedVehicle.quantity} available`
                      : "Out of stock"}
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
                  disabled={!!busyId || selectedVehicle.quantity <= 0}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-500/20 disabled:cursor-not-allowed disabled:opacity-60"
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

      {toast && (
        <div
          key={toast.id}
          role={toast.type === "error" ? "alert" : "status"}
          aria-live={toast.type === "error" ? "assertive" : "polite"}
          className="fixed bottom-5 right-5 z-[60] w-[calc(100%-2.5rem)] max-w-sm animate-[toast-in_200ms_ease-out] rounded-2xl border border-orange-100 bg-white p-4 shadow-2xl"
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
              <p className="font-semibold text-gray-900">{toast.message}</p>
              {toast.detail && (
                <p className="mt-1 text-sm leading-5 text-slate-500">
                  {toast.detail}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                if (toastTimer.current) {
                  clearTimeout(toastTimer.current);
                }

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
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
