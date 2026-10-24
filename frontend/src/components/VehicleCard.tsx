import type { Vehicle } from "../types";

interface Props {
  vehicle: Vehicle;
  onPurchase: (id: string) => void;
  busy?: boolean;
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
}: Props) {
  const soldOut = vehicle.quantity === 0;

  return (
    <article className="flex flex-col rounded-2xl bg-white p-5 shadow transition hover:shadow-lg">
      <span className="w-fit rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
        {vehicle.category}
      </span>
      <h3 className="mt-3 text-lg font-semibold text-slate-900">
        {vehicle.make} {vehicle.model}
      </h3>
      <p className="mt-1 text-2xl font-bold text-slate-900">
        {priceFormat.format(vehicle.price)}
      </p>
      <p
        className={`mt-1 text-sm ${soldOut ? "font-medium text-red-600" : "text-slate-500"}`}
      >
        {soldOut ? "Out of stock" : `${vehicle.quantity} in stock`}
      </p>
      <button
        type="button"
        disabled={soldOut || busy}
        onClick={() => onPurchase(vehicle.id)}
        className="mt-4 rounded-lg bg-indigo-600 py-2 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        Purchase
      </button>
    </article>
  );
}
