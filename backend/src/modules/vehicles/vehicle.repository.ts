import { PrismaClient, Vehicle } from "@prisma/client";
import { CreateVehicleInput } from "./vehicle.schema";

/** Abstraction the service depends on (Dependency Inversion). */
export interface VehicleRepository {
  create(data: CreateVehicleInput): Promise<Vehicle>;
}

export class PrismaVehicleRepository implements VehicleRepository {
  constructor(private readonly db: PrismaClient) {}

  create(data: CreateVehicleInput) {
    return this.db.vehicle.create({ data });
  }
}
