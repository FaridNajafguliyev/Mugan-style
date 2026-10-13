import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";

export const uploadProductImages = asyncHandler(async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[] | undefined;
  if (!files?.length) throw new AppError("Файлы не загружены", 400);

  const urls = files.map((f) => `/uploads/${f.filename}`);
  res.status(201).json({ urls });
});
