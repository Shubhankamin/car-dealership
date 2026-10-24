import { Vehicle } from "@prisma/client";
import { VehicleRepository } from "./vehicle.repository";
import { CreateVehicleInput, SearchVehicleInput } from "./vehicle.schema";

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
}
