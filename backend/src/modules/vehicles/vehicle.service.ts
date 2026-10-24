import { Vehicle } from "@prisma/client";
import { VehicleRepository } from "./vehicle.repository";
import { CreateVehicleInput, SearchVehicleInput } from "./vehicle.schema";
import { NotFoundError, ConflictError } from "../../errors/AppError";
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

  async purchase(id: string): Promise<Vehicle> {
    const purchased = await this.vehicles.decrementIfInStock(id);
    if (!purchased) {
      // Nothing was updated: either the vehicle doesn't exist or it is sold out.
      await this.getOrThrow(id);
      throw new ConflictError("Vehicle is out of stock");
    }
    return this.getOrThrow(id);
  }

  async restock(id: string, amount: number): Promise<Vehicle> {
    await this.getOrThrow(id);
    return this.vehicles.increment(id, amount);
  }
}
