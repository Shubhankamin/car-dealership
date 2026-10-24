import { api } from "./client";
import type { Vehicle, VehicleInput } from "../types";

export interface SearchFilters {
  make?: string;
  model?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
}

export async function listVehicles(): Promise<Vehicle[]> {
  const { data } = await api.get<Vehicle[]>("/vehicles");
  return data;
}

/** Sends only the filters the user filled in. */
export async function searchVehicles(
  filters: SearchFilters,
): Promise<Vehicle[]> {
  const params = Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) => value !== undefined && value.trim() !== "",
    ),
  );
  const { data } = await api.get<Vehicle[]>("/vehicles/search", { params });
  return data;
}

export async function createVehicle(input: VehicleInput): Promise<Vehicle> {
  const { data } = await api.post<Vehicle>("/vehicles", input);
  return data;
}

export async function updateVehicle(
  id: string,
  input: Partial<VehicleInput>,
): Promise<Vehicle> {
  const { data } = await api.put<Vehicle>(`/vehicles/${id}`, input);
  return data;
}

export async function deleteVehicle(id: string): Promise<void> {
  await api.delete(`/vehicles/${id}`);
}

export async function purchaseVehicle(id: string): Promise<Vehicle> {
  const { data } = await api.post<Vehicle>(`/vehicles/${id}/purchase`);
  return data;
}

export async function restockVehicle(
  id: string,
  quantity: number,
): Promise<Vehicle> {
  const { data } = await api.post<Vehicle>(`/vehicles/${id}/restock`, {
    quantity,
  });
  return data;
}
