import { Router } from "express";
import multer from "multer";
import { authenticate, authorize } from "../../middleware/auth";
import { UploadController } from "./upload.controller";
import { UploadService } from "./upload.service";
import { createImageStorage } from "./storage";

const MAX_BYTES = 2 * 1024 * 1024;

// Memory storage: the service decides where the bytes finally go.
const parser = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES, files: 1 },
});

const controller = new UploadController(
  new UploadService(createImageStorage()),
);

export const uploadRouter = Router();

// Auth runs before multer, so anonymous requests are rejected without buffering a file.
uploadRouter.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  parser.single("image"),
  controller.upload,
);
