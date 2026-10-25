import type { Vehicle } from "../types";

/**
 * Free-text match for the dashboard search box.
 * Every word must appear in the make or model, so "toyota cam" narrows to Toyota Camry.
 */
export function matchesKeyword(vehicle: Vehicle, keyword: string): boolean {
  const words = keyword.toLowerCase().split(/\s+/).filter(Boolean);
  const haystack = `${vehicle.make} ${vehicle.model}`.toLowerCase();
  return words.every((word) => haystack.includes(word));
}
