import { Vehicle } from "@prisma/client";
import { VehicleRepository } from "./vehicle.repository";
import { CreateVehicleInput } from "./vehicle.schema";

export class VehicleService {
  constructor(private readonly vehicles: VehicleRepository) {}

  create(input: CreateVehicleInput): Promise<Vehicle> {
    return this.vehicles.create(input);
  }
}
