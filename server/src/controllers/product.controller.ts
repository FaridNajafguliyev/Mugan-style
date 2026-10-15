import type { Request, Response } from "express";
import { z } from "zod";
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

export const listProductsAdmin = asyncHandler(async (_req: Request, res: Response) => {
  const products = await productService.listProductsAdmin();
  res.json({ products });
});

const productInputSchema = z.object({
  categoryKey: z.string().min(1),
  title: z.string().min(1),
  material: z.string().min(1),
  lining: z.string().min(1),
  sizes: z.string().min(1),
  priceKopecks: z.number().int().min(0),
  priceFrom: z.boolean(),
  description: z.string().min(1),
  images: z.array(z.string()).min(1),
});

const createProductSchema = productInputSchema.extend({
  initialStock: z.number().int().min(0),
});

const updateProductSchema = productInputSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const input = createProductSchema.parse(req.body);
  const product = await productService.createProduct(input);
  res.status(201).json({ product });
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const input = updateProductSchema.parse(req.body);
  const product = await productService.updateProduct(req.params.slug, input);
  res.json({ product });
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  await productService.deleteProduct(req.params.slug);
  res.status(204).send();
});
