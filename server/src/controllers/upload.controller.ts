import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";
import { uploadProductImage } from "../services/upload.service.js";

export const uploadProductImages = asyncHandler(async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[] | undefined;
  if (!files?.length) throw new AppError("Файлы не загружены", 400);

  const urls = await Promise.all(
    files.map((f) => uploadProductImage({ buffer: f.buffer, mimetype: f.mimetype, originalname: f.originalname })),
  );

  res.status(201).json({ urls });
});
