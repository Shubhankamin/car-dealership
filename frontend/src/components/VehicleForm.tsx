import { useState } from "react";
import type { FormEvent } from "react";
import type { Vehicle, VehicleInput } from "../types";
import ImageUpload from "./ImageUpload";

interface Props {
  vehicle?: Vehicle;
  onSubmit: (input: VehicleInput) => void | Promise<void>;
  onCancel: () => void;
  submitting?: boolean;
}

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100";

export default function VehicleForm({
  vehicle,
  onSubmit,
  onCancel,
  submitting = false,
}: Props) {
  const [make, setMake] = useState(vehicle?.make ?? "");
  const [model, setModel] = useState(vehicle?.model ?? "");
  const [category, setCategory] = useState(vehicle?.category ?? "");
  const [price, setPrice] = useState(vehicle ? String(vehicle.price) : "");
  const [quantity, setQuantity] = useState(
    vehicle ? String(vehicle.quantity) : "",
  );
  const [imageUrl, setImageUrl] = useState(vehicle?.imageUrl ?? "");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const photo = imageUrl.trim();
    onSubmit({
      make: make.trim(),
      model: model.trim(),
      category: category.trim(),
      price: Number(price),
      quantity: Number(quantity),
      ...(photo ? { imageUrl: photo } : {}),
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 rounded-2xl bg-white p-5 shadow sm:grid-cols-2"
    >
      <h2 className="text-lg font-semibold text-slate-900 sm:col-span-2">
        {vehicle ? "Edit vehicle" : "Add a vehicle"}
      </h2>

      <label className="text-sm font-medium text-slate-700">
        Make
        <input
          required
          value={make}
          onChange={(e) => setMake(e.target.value)}
          className={inputClass}
        />
      </label>
      <label className="text-sm font-medium text-slate-700">
        Model
        <input
          required
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className={inputClass}
        />
      </label>
      <label className="text-sm font-medium text-slate-700">
        Category
        <input
          required
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={inputClass}
        />
      </label>
      <label className="text-sm font-medium text-slate-700">
        Price
        <input
          required
          type="number"
          min={1}
          step="any"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className={inputClass}
        />
      </label>
      <label className="text-sm font-medium text-slate-700">
        Quantity
        <input
          required
          type="number"
          min={0}
          step={1}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className={inputClass}
        />
      </label>

      <div className="sm:col-span-2">
        <ImageUpload value={imageUrl} onChange={setImageUrl} />
      </div>

      <div className="flex items-end justify-end gap-2 sm:col-span-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
        >
          {vehicle ? "Save changes" : "Add vehicle"}
        </button>
      </div>
    </form>
  );
}
