import express from "express";
import cors from "cors";
import helmet from "helmet";
import { authRouter } from "./modules/auth/auth.routes";
import { errorHandler } from "./middleware/errorHandler";
import { vehicleRouter } from "./modules/vehicles/vehicle.routes";
export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use("/api/vehicles", vehicleRouter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);

app.use(errorHandler);
