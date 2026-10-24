import { Router } from "express";
import { prisma } from "../../lib/prisma";
// import { authenticate } from "../../middleware/auth";
import { authenticate, authorize } from "../../middleware/auth";
import { PrismaVehicleRepository } from "./vehicle.repository";
import { VehicleController } from "./vehicle.controller";
import { VehicleService } from "./vehicle.service";

const controller = new VehicleController(
  new VehicleService(new PrismaVehicleRepository(prisma)),
);

export const vehicleRouter = Router();

vehicleRouter.use(authenticate);
vehicleRouter.get("/search", controller.search); // must stay before any '/:id' route
vehicleRouter.get("/", controller.list);
vehicleRouter.post("/", controller.create);
vehicleRouter.put("/:id", controller.update);
vehicleRouter.delete("/:id", authorize("ADMIN"), controller.remove);
vehicleRouter.post("/:id/purchase", controller.purchase);
vehicleRouter.post("/:id/restock", authorize("ADMIN"), controller.restock);
