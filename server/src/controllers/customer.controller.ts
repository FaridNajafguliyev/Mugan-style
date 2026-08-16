import type { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as customerService from "../services/customer.service.js";

const leadSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(5),
  model: z.string().optional(),
  message: z.string().optional(),
});

export const listCustomers = asyncHandler(async (_req: Request, res: Response) => {
  const customers = await customerService.listCustomers();
  res.json({ customers });
});

export const createLead = asyncHandler(async (req: Request, res: Response) => {
  const input = leadSchema.parse(req.body);
  await customerService.createLead(input);
  res.status(201).json({ ok: true });
});

export const listLeads = asyncHandler(async (_req: Request, res: Response) => {
  const leads = await customerService.listLeads();
  res.json({ leads });
});
