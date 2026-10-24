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

  const soldOut = vehicle.quantity <= 0;
  const lowStock = !soldOut && vehicle.quantity <= 2;
  const name = `${vehicle.make} ${vehicle.model}`;

  const stockColor = soldOut
    ? "text-red-600"
    : lowStock
      ? "text-amber-700"
      : "text-emerald-700";

  const stockDot = soldOut
    ? "bg-red-500"
    : lowStock
      ? "bg-amber-500"
      : "bg-emerald-500";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-orange-100/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-950/[0.06]">
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-slate-800 via-slate-700 to-orange-900">
        {vehicle.imageUrl && !photoFailed ? (
          <img
            src={vehicle.imageUrl}
            alt={name}
            loading="lazy"
            onError={() => setPhotoFailed(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="flex h-full flex-col items-center justify-center gap-2 text-white/80"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-14 w-14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
            >
              <path
                d="M3 14l2-6h14l2 6M4 14h16v5H4zM7 19v2m10-2v2M7 11h10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="7" cy="16.5" r="1" />
              <circle cx="17" cy="16.5" r="1" />
            </svg>
            <span className="text-xs font-medium tracking-wide">
              {vehicle.make}
            </span>
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/25 via-transparent to-slate-950/10" />

        <span className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/95 px-3 py-1.5 text-xs font-semibold text-orange-800 shadow-sm backdrop-blur">
          {vehicle.category}
        </span>

        {/* Favorite */}
        {/* {onToggleFavorite && (
          <button
            type="button"
            onClick={() => onToggleFavorite(vehicle.id)}
            aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
            aria-pressed={favorite}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-white/95 text-slate-600 shadow-sm transition hover:scale-110 hover:text-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          >
            <svg
              viewBox="0 0 24 24"
              className={`h-[18px] w-[18px] transition-colors ${
                favorite ? "text-orange-600" : ""
              }`}
              fill={favorite ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <path
                d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 00-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 000-7.8z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )} */}

        <span
          className={`absolute bottom-3 left-3 rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${
            soldOut
              ? "bg-red-50 text-red-700"
              : lowStock
                ? "bg-amber-50 text-amber-800"
                : "bg-emerald-50 text-emerald-800"
          }`}
        >
          {soldOut ? "Sold out" : lowStock ? "Limited stock" : "Available"}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            {vehicle.make}
          </p>

          <h3 className="mt-1 text-lg font-bold tracking-tight text-slate-900 transition-colors group-hover:text-orange-700">
            {vehicle.model}
          </h3>

          <div className="mt-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-2xl font-extrabold tracking-tight text-slate-950">
                {priceFormat.format(vehicle.price)}
              </p>
              <p className="mt-1 text-xs text-slate-500">Listed price</p>
            </div>

            <div className="mb-1 flex shrink-0 items-center gap-1.5">
              <span
                className={`h-2 w-2 rounded-full ${stockDot}`}
                aria-hidden="true"
              />
              <span className={`text-xs font-semibold ${stockColor}`}>
                {soldOut ? "Out of stock" : `${vehicle.quantity} in stock`}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          disabled={soldOut || busy}
          onClick={() => onPurchase(vehicle.id)}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-orange-600/20 transition duration-200 hover:bg-orange-700 hover:shadow-md hover:shadow-orange-600/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
        >
          {busy ? (
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
              aria-hidden="true"
            />
          ) : (
            <svg
              viewBox="0 0 24 24"
              className="h-[18px] w-[18px]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <path
                d="M3 4h2l2.4 10.2a1 1 0 001 .8h8.4a1 1 0 001-.8L19 8H6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="9" cy="20" r="1" />
              <circle cx="17" cy="20" r="1" />
            </svg>
          )}

          {busy
            ? "Processing..."
            : soldOut
              ? "Currently unavailable"
              : "Purchase vehicle"}
        </button>
      </div>
    </article>
  );
}
