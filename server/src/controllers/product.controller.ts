import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as productService from "../services/product.service.js";

export const listProducts = asyncHandler(async (req: Request, res: Response) => {
  const category = typeof req.query.category === "string" ? req.query.category : undefined;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;
  const products = await productService.listProducts({ category, limit });
  res.json({ products });
});

export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.getProductBySlug(req.params.slug);
  res.json({ product });
});
