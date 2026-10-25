import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";
import { v2 as cloudinary } from "cloudinary";

export interface StoredImage {
  buffer: Buffer;
  extension: string;
}

/** Where uploaded images go. The service depends on this, not on a concrete provider. */
export interface ImageStorage {
  /** Saves the image and returns the URL the browser should use to load it. */
  save(image: StoredImage): Promise<string>;
}

export const uploadDir = () =>
  process.env.UPLOAD_DIR ?? path.resolve(process.cwd(), "uploads");

/** Development and tests. Files are lost on hosts with an ephemeral disk. */
export class LocalImageStorage implements ImageStorage {
  constructor(
    private readonly dir: string,
    private readonly baseUrl: string,
  ) {}

  async save({ buffer, extension }: StoredImage) {
    await fs.mkdir(this.dir, { recursive: true });
    // The name is generated here, never taken from the client, so it cannot escape the folder.
    const name = `${randomUUID()}.${extension}`;
    await fs.writeFile(path.join(this.dir, name), buffer);
    return `${this.baseUrl}/${name}`;
  }
}

/** Production. Reads its credentials from the CLOUDINARY_URL environment variable. */
export class CloudinaryImageStorage implements ImageStorage {
  constructor(private readonly folder = "autostock") {
    cloudinary.config({ secure: true });
  }

  save({ buffer }: StoredImage) {
    return new Promise<string>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: this.folder, resource_type: "image" },
          (err, result) => {
            if (err || !result)
              return reject(err ?? new Error("Image upload failed"));
            resolve(result.secure_url);
          },
        )
        .end(buffer);
    });
  }
}

export function createImageStorage(): ImageStorage {
  return process.env.STORAGE_DRIVER === "cloudinary"
    ? new CloudinaryImageStorage()
    : new LocalImageStorage(uploadDir(), "/api/uploads");
}
