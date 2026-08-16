import type { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as inventoryService from "../services/inventory.service.js";

const setStockSchema = z.object({ stock: z.number().int().min(0) });

export const listInventory = asyncHandler(async (_req: Request, res: Response) => {
  const inventory = await inventoryService.listInventory();
  res.json({ inventory });
});

export const setStock = asyncHandler(async (req: Request, res: Response) => {
  const { stock } = setStockSchema.parse(req.body);
  const row = await inventoryService.setStock(req.params.id, stock);
  res.json({ inventory: row });
});
