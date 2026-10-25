import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../../errors/AppError";
import { UploadService } from "./upload.service";

export class UploadController {
  constructor(private readonly service: UploadService) {}

  upload = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file)
        throw new BadRequestError(
          "No image was uploaded (form field name: image)",
        );
      const url = await this.service.uploadImage(req.file.buffer);
      res.status(201).json({ url });
    } catch (err) {
      next(err);
    }
  };
}
