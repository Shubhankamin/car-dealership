import { BadRequestError } from "../../errors/AppError";
import { detectImageType } from "./imageType";
import { ImageStorage } from "./storage";

export class UploadService {
  constructor(private readonly storage: ImageStorage) {}

  async uploadImage(buffer: Buffer): Promise<string> {
    const type = detectImageType(buffer);
    if (!type)
      throw new BadRequestError("File must be a JPEG, PNG or WebP image");
    return this.storage.save({ buffer, extension: type.extension });
  }
}
