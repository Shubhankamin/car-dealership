import { Vehicle } from "@prisma/client";
import { VehicleRepository } from "./vehicle.repository";
import { CreateVehicleInput, SearchVehicleInput } from "./vehicle.schema";
import { NotFoundError } from "../../errors/AppError";
import { UpdateVehicleInput } from "./vehicle.schema";
export class VehicleService {
  constructor(private readonly vehicles: VehicleRepository) {}
  list(): Promise<Vehicle[]> {
    return this.vehicles.findAll();
  }

  search(filters: SearchVehicleInput): Promise<Vehicle[]> {
    return this.vehicles.search(filters);
  }
  create(input: CreateVehicleInput): Promise<Vehicle> {
    return this.vehicles.create(input);
  }

  async update(id: string, input: UpdateVehicleInput): Promise<Vehicle> {
    await this.getOrThrow(id);
    return this.vehicles.update(id, input);
  }

  async remove(id: string): Promise<void> {
    await this.getOrThrow(id);
    await this.vehicles.delete(id);
  }

  private async getOrThrow(id: string): Promise<Vehicle> {
    const vehicle = await this.vehicles.findById(id);
    if (!vehicle) throw new NotFoundError("Vehicle not found");
    return vehicle;
  }
}
