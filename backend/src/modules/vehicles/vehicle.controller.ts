import { NextFunction, Request, Response } from "express";
import { createVehicleSchema, searchVehicleSchema } from "./vehicle.schema";
import { VehicleService } from "./vehicle.service";
import { updateVehicleSchema } from "./vehicle.schema";
import { restockSchema } from "./vehicle.schema";
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

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = updateVehicleSchema.parse(req.body);
      res.json(await this.service.update(String(req.params.id), input));
    } catch (err) {
      next(err);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.remove(String(req.params.id));
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };

  purchase = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(await this.service.purchase(String(req.params.id)));
    } catch (err) {
      next(err);
    }
  };

  restock = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { quantity } = restockSchema.parse(req.body);
      res.json(await this.service.restock(String(req.params.id), quantity));
    } catch (err) {
      next(err);
    }
  };
}
