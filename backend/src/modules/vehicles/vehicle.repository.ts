import { Prisma, PrismaClient, Vehicle } from "@prisma/client";
import { CreateVehicleInput, SearchVehicleInput } from "./vehicle.schema";
import { UpdateVehicleInput } from "./vehicle.schema";
export interface VehicleRepository {
  create(data: CreateVehicleInput): Promise<Vehicle>;
  findAll(): Promise<Vehicle[]>;
  search(filters: SearchVehicleInput): Promise<Vehicle[]>;
  findById(id: string): Promise<Vehicle | null>;
  update(id: string, data: UpdateVehicleInput): Promise<Vehicle>;
  delete(id: string): Promise<void>;
}

const defaultOrder: Prisma.VehicleOrderByWithRelationInput[] = [
  { make: "asc" },
  { model: "asc" },
];

export class PrismaVehicleRepository implements VehicleRepository {
  constructor(private readonly db: PrismaClient) {}

  create(data: CreateVehicleInput) {
    return this.db.vehicle.create({ data });
  }

  findAll() {
    return this.db.vehicle.findMany({ orderBy: defaultOrder });
  }

  search({ make, model, category, minPrice, maxPrice }: SearchVehicleInput) {
    const where: Prisma.VehicleWhereInput = {};

    // SQLite's LIKE is case-insensitive for ASCII, so no `mode` option is needed
    // (and `mode: 'insensitive'` is not supported on SQLite).
    if (make) where.make = { contains: make };
    if (model) where.model = { contains: model };
    if (category) where.category = { contains: category };
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = { gte: minPrice, lte: maxPrice };
    }

    return this.db.vehicle.findMany({ where, orderBy: defaultOrder });
  }

  findById(id: string) {
    return this.db.vehicle.findUnique({ where: { id } });
  }

  update(id: string, data: UpdateVehicleInput) {
    return this.db.vehicle.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.db.vehicle.delete({ where: { id } });
  }
}
