import { NextFunction, Request, Response } from "express";
import { createVehicleSchema } from "./vehicle.schema";
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
}
