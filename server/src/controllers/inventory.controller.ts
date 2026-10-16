import type { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as inventoryService from "../services/inventory.service.js";

const setSizeStockSchema = z.object({ stock: z.number().int().min(0) });
const addSizeSchema = z.object({ size: z.string().min(1), stock: z.number().int().min(0).default(0) });
const updateSkuSchema = z.object({ sku: z.string().min(1) });

export const listInventory = asyncHandler(async (_req: Request, res: Response) => {
  const inventory = await inventoryService.listInventory();
  res.json({ inventory });
});

export const updateSku = asyncHandler(async (req: Request, res: Response) => {
  const { sku } = updateSkuSchema.parse(req.body);
  const row = await inventoryService.updateSku(req.params.productId, sku);
  res.json({ inventory: row });
});

export const setSizeStock = asyncHandler(async (req: Request, res: Response) => {
  const { stock } = setSizeStockSchema.parse(req.body);
  const row = await inventoryService.setSizeStock(req.params.productId, req.params.size, stock);
  res.json({ inventory: row });
});

export const addSize = asyncHandler(async (req: Request, res: Response) => {
  const { size, stock } = addSizeSchema.parse(req.body);
  const row = await inventoryService.addSizeRow(req.params.productId, size, stock);
  res.status(201).json({ inventory: row });
});

export const removeSize = asyncHandler(async (req: Request, res: Response) => {
  await inventoryService.removeSizeRow(req.params.productId, req.params.size);
  res.status(204).send();
});
