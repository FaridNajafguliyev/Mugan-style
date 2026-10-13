import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env.js";

const LOCAL_UPLOADS_DIR = path.join(import.meta.dirname, "../../uploads");

const useCloudinary = Boolean(
  env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET,
);

if (useCloudinary) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
} else {
  fs.mkdirSync(LOCAL_UPLOADS_DIR, { recursive: true });
}

export interface UploadedFile {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
}

/**
 * Persists one uploaded image and returns its public URL. Uses Cloudinary
 * when configured (durable — survives redeploys on hosts with an ephemeral
 * filesystem), otherwise falls back to local disk under server/uploads/
 * (fine for local dev, but lost on redeploy on most PaaS hosts).
 */
export async function uploadProductImage(file: UploadedFile): Promise<string> {
  if (useCloudinary) {
    const base64 = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
    const result = await cloudinary.uploader.upload(base64, {
      folder: "mugan-style/products",
      resource_type: "image",
    });
    return result.secure_url;
  }

  const ext = path.extname(file.originalname).toLowerCase();
  const filename = `${crypto.randomUUID()}${ext}`;
  await fs.promises.writeFile(path.join(LOCAL_UPLOADS_DIR, filename), file.buffer);
  return `/uploads/${filename}`;
}

export { LOCAL_UPLOADS_DIR, useCloudinary };
