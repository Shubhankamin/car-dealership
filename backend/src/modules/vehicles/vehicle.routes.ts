import { Router } from "express";
import { prisma } from "../../lib/prisma";
// import { authenticate } from "../../middleware/auth";
import {authenticate} from "../../middleware/auth";
import { PrismaVehicleRepository } from "./vehicle.repository";
import { VehicleController } from "./vehicle.controller";
import { VehicleService } from "./vehicle.service";

const controller = new VehicleController(
  new VehicleService(new PrismaVehicleRepository(prisma)),
);

export const vehicleRouter = Router();

vehicleRouter.use(authenticate);
vehicleRouter.post("/", controller.create);
