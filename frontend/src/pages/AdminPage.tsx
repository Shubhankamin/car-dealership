import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "../api/client";
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

export default function AdminPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({ mode: "closed" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setVehicles(await listVehicles());
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /** Runs an action, then refreshes the list and shows a message. */
  async function run(action: () => Promise<unknown>, success: string) {
    setError(null);
    setNotice(null);
    setSaving(true);
    try {
      await action();
      setNotice(success);
      setForm({ mode: "closed" });
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
        "Vehicle updated.",
      );
    }
    return run(() => createVehicle(input), "Vehicle added.");
  }

  function handleDelete(v: Vehicle) {
    if (!window.confirm(`Delete ${v.make} ${v.model}? This cannot be undone.`))
      return;
    return run(() => deleteVehicle(v.id), "Vehicle deleted.");
  }

  function handleRestock(v: Vehicle) {
    const answer = window.prompt(
      `How many units of ${v.make} ${v.model} to add?`,
      "5",
    );
    if (answer === null) return;
    const amount = Number(answer);
    if (!Number.isInteger(amount) || amount < 1) {
      setError("Enter a whole number of at least 1.");
      return;
    }
    return run(() => restockVehicle(v.id, amount), `Added ${amount} units.`);
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">
            Manage inventory
          </h1>
          {form.mode === "closed" && (
            <button
              onClick={() => setForm({ mode: "add" })}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Add vehicle
            </button>
          )}
        </div>

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

        {form.mode !== "closed" && (
          <VehicleForm
            key={form.mode === "edit" ? form.vehicle.id : "new"}
            vehicle={form.mode === "edit" ? form.vehicle : undefined}
            onSubmit={handleSubmit}
            onCancel={() => setForm({ mode: "closed" })}
            submitting={saving}
          />
        )}

        {loading ? (
          <p className="text-slate-500">Loading...</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl bg-white shadow">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3">Vehicle</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v) => (
                  <tr key={v.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {v.make} {v.model}
                    </td>
                    <td className="px-4 py-3">{v.category}</td>
                    <td className="px-4 py-3">${v.price.toLocaleString()}</td>
                    <td className="px-4 py-3">{v.quantity}</td>
                    <td className="space-x-2 px-4 py-3 text-right">
                      <button
                        onClick={() => handleRestock(v)}
                        className="text-indigo-600 hover:underline"
                      >
                        Restock
                      </button>
                      <button
                        onClick={() => setForm({ mode: "edit", vehicle: v })}
                        className="text-indigo-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(v)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
