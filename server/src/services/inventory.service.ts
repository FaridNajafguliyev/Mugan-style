import { Types } from "mongoose";
import { Inventory } from "../models/Inventory.js";
import { AppError } from "../utils/AppError.js";

export interface StockLine {
  productId: Types.ObjectId | string;
  qty: number;
}

/**
 * Atomically reserves stock for each line. If any line can't be reserved
 * (insufficient `available = stock - reserved`), compensates by releasing
 * everything already reserved in this call and throws.
 */
export async function reserveStock(lines: StockLine[]): Promise<void> {
  const reserved: StockLine[] = [];

  for (const line of lines) {
    const updated = await Inventory.findOneAndUpdate(
      {
        product: line.productId,
        $expr: { $gte: [{ $subtract: ["$stock", "$reserved"] }, line.qty] },
      },
      { $inc: { reserved: line.qty } },
    );

    if (!updated) {
      if (reserved.length > 0) await releaseStock(reserved);
      throw new AppError("Недостаточно товара на складе", 409, "OUT_OF_STOCK");
    }

    reserved.push(line);
  }
}

export async function releaseStock(lines: StockLine[]): Promise<void> {
  for (const line of lines) {
    await Inventory.updateOne({ product: line.productId }, { $inc: { reserved: -line.qty } });
  }
}

export async function commitStock(lines: StockLine[]): Promise<void> {
  for (const line of lines) {
    await Inventory.updateOne(
      { product: line.productId },
      { $inc: { reserved: -line.qty, stock: -line.qty } },
    );
  }
}

export async function restockAfterCancel(lines: StockLine[]): Promise<void> {
  for (const line of lines) {
    await Inventory.updateOne({ product: line.productId }, { $inc: { stock: line.qty } });
  }
}

export interface InventoryRow {
  id: string;
  productId: string;
  productSlug: string;
  title: string;
  sku: string;
  stock: number;
  reserved: number;
  available: number;
}

export async function listInventory(): Promise<InventoryRow[]> {
  const rows = await Inventory.find().populate("product", "title slug").sort({ sku: 1 }).lean();
  return rows.map((row) => ({
    id: String(row._id),
    productId: String(row.product?._id ?? row.product),
    productSlug: (row.product as unknown as { slug?: string })?.slug ?? "",
    title: (row.product as unknown as { title?: string })?.title ?? "—",
    sku: row.sku,
    stock: row.stock,
    reserved: row.reserved,
    available: row.stock - row.reserved,
  }));
}

export async function setStock(inventoryId: string, stock: number): Promise<InventoryRow> {
  if (stock < 0) throw new AppError("Остаток не может быть отрицательным", 400);

  const row = await Inventory.findById(inventoryId).populate("product", "title slug");
  if (!row) throw new AppError("Позиция склада не найдена", 404);
  if (stock < row.reserved) {
    throw new AppError(
      `Нельзя установить остаток ниже зарезервированного (${row.reserved})`,
      409,
      "STOCK_BELOW_RESERVED",
    );
  }

  row.stock = stock;
  await row.save();

  return {
    id: String(row._id),
    productId: String((row.product as unknown as { _id: unknown })?._id ?? row.product),
    productSlug: (row.product as unknown as { slug?: string })?.slug ?? "",
    title: (row.product as unknown as { title?: string })?.title ?? "—",
    sku: row.sku,
    stock: row.stock,
    reserved: row.reserved,
    available: row.stock - row.reserved,
  };
}
