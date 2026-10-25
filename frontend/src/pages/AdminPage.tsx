import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "../api/client";
import { formatPrice } from "../utils/currency";
import {
  createVehicle,
  deleteVehicle,
  listVehicles,
  restockVehicle,
  updateVehicle,
} from "../api/vehicles";
import Navbar from "../components/Navbar";
import VehicleForm from "../components/VehicleForm";
import type { Vehicle, VehicleInput } from "../types";

type FormState =
  | { mode: "closed" }
  | { mode: "add" }
  | { mode: "edit"; vehicle: Vehicle };

type DialogState =
  | { mode: "closed" }
  | { mode: "delete"; vehicle: Vehicle }
  | { mode: "restock"; vehicle: Vehicle };

export default function AdminPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({ mode: "closed" });
  const [dialog, setDialog] = useState<DialogState>({ mode: "closed" });
  const [saving, setSaving] = useState(false);
  const [restockAmount, setRestockAmount] = useState("5");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await listVehicles();
      setVehicles(data);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function run(action: () => Promise<unknown>, success: string) {
    setError(null);
    setNotice(null);
    setSaving(true);

    try {
      await action();
      setNotice(success);
      setForm({ mode: "closed" });
      setDialog({ mode: "closed" });
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  function handleSubmit(input: VehicleInput) {
    if (form.mode === "edit") {
      return run(
        () => updateVehicle(form.vehicle.id, input),
        "Vehicle updated successfully.",
      );
    }

    return run(
      () => createVehicle(input),
      "Vehicle added to inventory successfully.",
    );
  }

  function handleDelete() {
    if (dialog.mode !== "delete") return;

    const vehicle = dialog.vehicle;

    return run(
      () => deleteVehicle(vehicle.id),
      `${vehicle.make} ${vehicle.model} was deleted.`,
    );
  }

  function handleRestock() {
    if (dialog.mode !== "restock") return;

    const vehicle = dialog.vehicle;
    const amount = Number(restockAmount);

    if (!Number.isSafeInteger(amount) || amount < 1) {
      setError("Enter a whole number greater than zero.");
      return;
    }

    return run(
      () => restockVehicle(vehicle.id, amount),
      `${amount} unit${amount === 1 ? "" : "s"} added to ${vehicle.make} ${vehicle.model}.`,
    );
  }

  const filteredVehicles = vehicles.filter((vehicle) =>
    `${vehicle.make} ${vehicle.model} ${vehicle.category}`
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  );

  const totalUnits = vehicles.reduce(
    (sum, vehicle) => sum + vehicle.quantity,
    0,
  );
  const lowStockCount = vehicles.filter(
    (vehicle) => vehicle.quantity > 0 && vehicle.quantity <= 2,
  ).length;
  const outOfStockCount = vehicles.filter(
    (vehicle) => vehicle.quantity <= 0,
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {/* Header */}
        <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-orange-700">
              <span className="h-2 w-2 rounded-full bg-orange-600" />
              Administration
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              Manage inventory
            </h1>
            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Manage vehicles, monitor stock, and keep your dealership up to
              date.
            </p>
          </div>

          {form.mode === "closed" && (
            <button
              type="button"
              onClick={() => {
                setError(null);
                setNotice(null);
                setForm({ mode: "add" });
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
              Add vehicle
            </button>
          )}
        </section>

        {/* Summary cards */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Vehicle models",
              value: loading ? "—" : vehicles.length,
              icon: "car",
              color: "bg-orange-100 text-orange-700",
            },
            {
              label: "Total units in stock",
              value: loading ? "—" : totalUnits,
              icon: "boxes",
              color: "bg-emerald-100 text-emerald-700",
            },
            {
              label: "Low stock",
              value: loading ? "—" : lowStockCount,
              icon: "alert",
              color: "bg-amber-100 text-amber-700",
            },
            {
              label: "Out of stock",
              value: loading ? "—" : outOfStockCount,
              icon: "empty",
              color: "bg-red-100 text-red-700",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-4 rounded-2xl border border-orange-100 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${stat.color}`}
              >
                {stat.icon === "car" && (
                  <svg
                    viewBox="0 0 24 24"
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    <path
                      d="M3 14l2-6h14l2 6M4 14h16v5H4zM7 19v2m10-2v2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                {stat.icon === "boxes" && (
                  <svg
                    viewBox="0 0 24 24"
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    <path
                      d="m12 3 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 16l9 5 9-5M12 13v8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                {stat.icon === "alert" && (
                  <svg
                    viewBox="0 0 24 24"
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 3 2.8 20h18.4L12 3Z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path d="M12 9v4m0 3h.01" strokeLinecap="round" />
                  </svg>
                )}
                {stat.icon === "empty" && (
                  <svg
                    viewBox="0 0 24 24"
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="m9 9 6 6m0-6-6 6" strokeLinecap="round" />
                  </svg>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-500">
                  {stat.label}
                </p>
                <p className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950">
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </section>

        {/* Feedback */}
        {notice && (
          <div
            role="status"
            className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
          >
            <span className="font-bold">✓</span>
            <p className="flex-1">{notice}</p>
            <button
              type="button"
              onClick={() => setNotice(null)}
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            <span className="font-bold">!</span>
            <p className="flex-1">{error}</p>
            <button
              type="button"
              onClick={() => setError(null)}
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
        )}

        {/* Add / edit form */}
        {form.mode !== "closed" && (
          <section className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {form.mode === "edit" ? "Edit vehicle" : "Add a vehicle"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {form.mode === "edit"
                    ? "Update the vehicle details below."
                    : "Enter the details for your new inventory item."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setForm({ mode: "closed" })}
                disabled={saving}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-orange-50 hover:text-orange-700 disabled:opacity-50"
                aria-label="Close form"
              >
                ✕
              </button>
            </div>
            <VehicleForm
              key={form.mode === "edit" ? form.vehicle.id : "new"}
              vehicle={form.mode === "edit" ? form.vehicle : undefined}
              onSubmit={handleSubmit}
              onCancel={() => setForm({ mode: "closed" })}
              submitting={saving}
            />
          </section>
        )}

        {/* Inventory table */}
        <section className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:px-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Vehicle inventory
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Review and manage your dealership stock.
              </p>
            </div>
            <div className="relative w-full sm:max-w-xs">
              <svg
                viewBox="0 0 24 24"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <circle cx="10.5" cy="10.5" r="6.5" />
                <path d="m16 16 4.5 4.5" strokeLinecap="round" />
              </svg>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search inventory..."
                aria-label="Search inventory"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100"
              />
            </div>
          </div>

          {loading ? (
            <div className="space-y-3 p-6">
              {Array.from({ length: 4 }, (_, i) => (
                <div
                  key={i}
                  className="h-14 animate-pulse rounded-xl bg-slate-100"
                />
              ))}
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                <svg
                  viewBox="0 0 24 24"
                  className="h-7 w-7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <circle cx="10.5" cy="10.5" r="6.5" />
                  <path d="m16 16 4.5 4.5" />
                </svg>
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">
                No vehicles found
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {search
                  ? "Try a different search term."
                  : "Add a vehicle to start building your inventory."}
              </p>
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="mt-4 text-sm font-semibold text-orange-700 hover:text-orange-800"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-orange-50/70 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Vehicle</th>
                    <th className="px-4 py-4 font-semibold">Category</th>
                    <th className="px-4 py-4 font-semibold">Price</th>
                    <th className="px-4 py-4 font-semibold">Stock level</th>
                    <th className="px-6 py-4 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredVehicles.map((v) => {
                    const soldOut = v.quantity <= 0;
                    const lowStock = !soldOut && v.quantity <= 2;

                    return (
                      <tr
                        key={v.id}
                        className="transition hover:bg-orange-50/40"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {v.imageUrl ? (
                              <img
                                src={v.imageUrl}
                                alt=""
                                loading="lazy"
                                className="h-10 w-14 shrink-0 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
                                <svg
                                  viewBox="0 0 24 24"
                                  className="h-5 w-5"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                  aria-hidden="true"
                                >
                                  <path
                                    d="M3 14l2-6h14l2 6M4 14h16v5H4zM7 19v2m10-2v2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-slate-900">
                                {v.make} {v.model}
                              </p>
                              <p className="mt-0.5 text-xs text-slate-400">
                                ID: {v.id}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                            {v.category}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 font-semibold text-slate-800">
                          {formatPrice(v.price)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col items-start gap-1.5">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                soldOut
                                  ? "bg-red-50 text-red-700"
                                  : lowStock
                                    ? "bg-amber-50 text-amber-800"
                                    : "bg-emerald-50 text-emerald-700"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  soldOut
                                    ? "bg-red-500"
                                    : lowStock
                                      ? "bg-amber-500"
                                      : "bg-emerald-500"
                                }`}
                              />
                              {soldOut
                                ? "Out of stock"
                                : lowStock
                                  ? "Low stock"
                                  : "In stock"}
                            </span>
                            <span className="text-xs text-slate-500">
                              {v.quantity} {v.quantity === 1 ? "unit" : "units"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              disabled={saving}
                              onClick={() => {
                                setError(null);
                                setNotice(null);
                                setRestockAmount("5");
                                setDialog({ mode: "restock", vehicle: v });
                              }}
                              className="rounded-lg border border-orange-200 px-3 py-2 text-xs font-semibold text-orange-700 transition hover:border-orange-300 hover:bg-orange-50 disabled:opacity-50"
                            >
                              Restock
                            </button>
                            <button
                              type="button"
                              disabled={saving}
                              onClick={() => {
                                setError(null);
                                setNotice(null);
                                setForm({ mode: "edit", vehicle: v });
                              }}
                              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-800 disabled:opacity-50"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              disabled={saving}
                              onClick={() => {
                                setError(null);
                                setNotice(null);
                                setDialog({ mode: "delete", vehicle: v });
                              }}
                              className="rounded-lg border border-red-100 px-3 py-2 text-xs font-semibold text-red-600 transition hover:border-red-200 hover:bg-red-50 disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && filteredVehicles.length > 0 && (
            <div className="border-t border-slate-100 bg-slate-50/70 px-6 py-3 text-xs text-slate-500">
              Showing {filteredVehicles.length} of {vehicles.length} vehicle
              models
            </div>
          )}
        </section>
      </main>

      {/* Delete / restock dialogs */}
      {dialog.mode !== "closed" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !saving) {
              setDialog({ mode: "closed" });
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-dialog-title"
            className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <span
                  className={`text-xs font-bold uppercase tracking-widest ${
                    dialog.mode === "delete"
                      ? "text-red-600"
                      : "text-orange-700"
                  }`}
                >
                  {dialog.mode === "delete"
                    ? "Remove inventory"
                    : "Inventory adjustment"}
                </span>
                <h2
                  id="admin-dialog-title"
                  className="mt-1 text-xl font-bold text-slate-950"
                >
                  {dialog.mode === "delete"
                    ? "Delete this vehicle?"
                    : "Restock vehicle"}
                </h2>
              </div>
              <button
                type="button"
                disabled={saving}
                onClick={() => setDialog({ mode: "closed" })}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 disabled:opacity-50"
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-bold text-slate-900">
                  {dialog.vehicle.make} {dialog.vehicle.model}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {dialog.vehicle.category} ·{" "}
                  {formatPrice(dialog.vehicle.price)}
                </p>
                <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3 text-sm">
                  <span className="text-slate-500">Current stock</span>
                  <span className="font-semibold text-slate-900">
                    {dialog.vehicle.quantity} units
                  </span>
                </div>
              </div>

              {dialog.mode === "delete" ? (
                <p className="text-sm leading-6 text-slate-600">
                  This will permanently delete the vehicle from your inventory.
                  This action cannot be undone.
                </p>
              ) : (
                <div className="space-y-2">
                  <label
                    htmlFor="restock-amount"
                    className="block text-sm font-semibold text-slate-700"
                  >
                    Units to add
                  </label>
                  <input
                    id="restock-amount"
                    type="number"
                    min="1"
                    step="1"
                    value={restockAmount}
                    onChange={(e) => setRestockAmount(e.target.value)}
                    autoFocus
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                  <p className="text-xs text-slate-500">
                    Enter a positive whole number.
                  </p>
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setDialog({ mode: "closed" })}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={
                    saving ||
                    (dialog.mode === "restock" &&
                      (!Number.isSafeInteger(Number(restockAmount)) ||
                        Number(restockAmount) < 1))
                  }
                  onClick={() => {
                    if (dialog.mode === "delete") void handleDelete();
                    else void handleRestock();
                  }}
                  className={`rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    dialog.mode === "delete"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-orange-600 hover:bg-orange-700"
                  }`}
                >
                  {saving
                    ? "Processing..."
                    : dialog.mode === "delete"
                      ? "Delete vehicle"
                      : "Confirm restock"}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
