import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as categoryService from "../services/category.service.js";

export const listCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await categoryService.listCategories();
  res.json({ categories });
});
