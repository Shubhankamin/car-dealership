import { NextFunction, Request, Response } from "express";
import { createVehicleSchema, searchVehicleSchema } from "./vehicle.schema";
import { VehicleService } from "./vehicle.service";

export class VehicleController {
  constructor(private readonly service: VehicleService) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = createVehicleSchema.parse(req.body);
      res.status(201).json(await this.service.create(input));
    } catch (err) {
      next(err);
    }
  };

  list = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(await this.service.list());
    } catch (err) {
      next(err);
    }
  };

  search = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = searchVehicleSchema.parse(req.query);
      res.json(await this.service.search(filters));
    } catch (err) {
      next(err);
    }
  };
}
