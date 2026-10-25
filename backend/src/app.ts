import express from "express";
import cors from "cors";
import helmet from "helmet";
import { authRouter } from "./modules/auth/auth.routes";
import { errorHandler } from "./middleware/errorHandler";
import { vehicleRouter } from "./modules/vehicles/vehicle.routes";
export const app = express();
import { uploadRouter } from "./modules/uploads/upload.routes";
import { uploadDir } from "./modules/uploads/storage";
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use("/api/vehicles", vehicleRouter);
app.use(
  "/api/uploads",
  express.static(uploadDir(), {
    maxAge: "7d",
    immutable: true, 
    setHeaders: (res) =>
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin"),
  }),
);
app.use("/api/uploads", uploadRouter);
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);

app.use(errorHandler);
