import { useState } from "react";
import type { Vehicle } from "../types";

interface Props {
  vehicle: Vehicle;
  onPurchase: (id: string) => void;
  busy?: boolean;
  favorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

const priceFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function VehicleCard({
  vehicle,
  onPurchase,
  busy = false,
  favorite = false,
  onToggleFavorite,
}: Props) {
  const [photoFailed, setPhotoFailed] = useState(false);
  const soldOut = vehicle.quantity === 0;
  const lowStock = !soldOut && vehicle.quantity <= 2;
  const name = `${vehicle.make} ${vehicle.model}`;
  const dot = soldOut
    ? "bg-red-500"
    : lowStock
      ? "bg-amber-500"
      : "bg-emerald-500";
  const text = soldOut
    ? "text-red-600"
    : lowStock
      ? "text-amber-600"
      : "text-emerald-600";

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-slate-800 to-indigo-600">
        {vehicle.imageUrl && !photoFailed ? (
          <img
            src={vehicle.imageUrl}
            alt={name}
            loading="lazy"
            onError={() => setPhotoFailed(true)}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="flex h-full items-center justify-center text-white/70"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-12 w-12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M5 16l1.5-5a2 2 0 011.9-1.4h7.2A2 2 0 0117.5 11L19 16M5 16h14M5 16v3m14-3v3M8 13h.01M16 13h.01" />
            </svg>
          </div>
        )}

        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-indigo-700 shadow-sm">
          {vehicle.category}
        </span>

        {onToggleFavorite && (
          <button
            type="button"
            onClick={() => onToggleFavorite(vehicle.id)}
            aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
            aria-pressed={favorite}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow-sm transition hover:scale-110"
          >
            <svg
              viewBox="0 0 24 24"
              className={`h-4 w-4 ${favorite ? "text-red-500" : "text-slate-500"}`}
              fill={favorite ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 00-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 000-7.8z" />
            </svg>
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold text-slate-900">{name}</h3>
        <p className="mt-1 text-xl font-extrabold text-slate-900">
          {priceFormat.format(vehicle.price)}
        </p>
        <p className="mt-1 flex items-center gap-2 text-sm">
          <span className={`h-2 w-2 rounded-full ${dot}`} aria-hidden="true" />
          <span className={`font-medium ${text}`}>
            {soldOut ? "Out of stock" : `${vehicle.quantity} in stock`}
          </span>
        </p>

        <button
          type="button"
          disabled={soldOut || busy}
          onClick={() => onPurchase(vehicle.id)}
          className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M3 4h2l2.4 10.2a1 1 0 001 .8h8.4a1 1 0 001-.8L19 8H6M9 20h.01M17 20h.01" />
          </svg>
          {busy ? "Purchasing..." : "Purchase"}
        </button>
      </div>
    </article>
  );
}
