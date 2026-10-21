import { Types } from "mongoose";
import { Inventory, type InventoryDoc } from "../models/Inventory.js";
import { AppError } from "../utils/AppError.js";

export interface StockLine {
  productId: Types.ObjectId | string;
  size: string;
  qty: number;
}

/**
 * Atomically reserves stock for each line. If any line can't be reserved
 * (insufficient `available = stock - reserved` for that size), compensates
 * by releasing everything already reserved in this call and throws.
 */
export async function reserveStock(lines: StockLine[]): Promise<void> {
  const reserved: StockLine[] = [];

  for (const line of lines) {
    const inv = await Inventory.findOne({ product: line.productId });
    const row = inv?.sizes.find((s) => s.size === line.size);
    const available = row ? row.stock - row.reserved : 0;

    if (!row || available < line.qty) {
      if (reserved.length > 0) await releaseStock(reserved);
      throw new AppError(`Недостаточно товара на складе (размер ${line.size})`, 409, "OUT_OF_STOCK");
    }

    await Inventory.updateOne(
      { product: line.productId, "sizes.size": line.size },
      { $inc: { "sizes.$.reserved": line.qty } },
    );
    reserved.push(line);
  }
}

export async function releaseStock(lines: StockLine[]): Promise<void> {
  for (const line of lines) {
    await Inventory.updateOne(
      { product: line.productId, "sizes.size": line.size },
      { $inc: { "sizes.$.reserved": -line.qty } },
    );
  }
}

export async function commitStock(lines: StockLine[]): Promise<void> {
  for (const line of lines) {
    await Inventory.updateOne(
      { product: line.productId, "sizes.size": line.size },
      { $inc: { "sizes.$.reserved": -line.qty, "sizes.$.stock": -line.qty } },
    );
  }
}

export async function restockAfterCancel(lines: StockLine[]): Promise<void> {
  for (const line of lines) {
    await Inventory.updateOne(
      { product: line.productId, "sizes.size": line.size },
      { $inc: { "sizes.$.stock": line.qty } },
    );
  }
}

export interface SizeAvailability {
  size: string;
  available: number;
}

export async function getSizeAvailability(productId: Types.ObjectId | string): Promise<SizeAvailability[]> {
  const inv = await Inventory.findOne({ product: productId }).lean();
  if (!inv) return [];
  return inv.sizes.map((s) => ({ size: s.size, available: Math.max(0, s.stock - s.reserved) }));
}

export async function getTotalAvailable(productId: Types.ObjectId | string): Promise<number> {
  const inv = await Inventory.findOne({ product: productId }).lean();
  if (!inv) return 0;
  return inv.sizes.reduce((sum, s) => sum + Math.max(0, s.stock - s.reserved), 0);
}

/**
 * Batched form of getSizeAvailability — one query for every product in the
 * list instead of one query per product (the catalog/admin list calls this
 * per product it renders, so that pattern gets slower as the catalog grows).
 */
export async function getSizeAvailabilityMany(
  productIds: (Types.ObjectId | string)[],
): Promise<Map<string, SizeAvailability[]>> {
  const rows = await Inventory.find({ product: { $in: productIds } }).lean();
  const map = new Map<string, SizeAvailability[]>();
  for (const inv of rows) {
    map.set(
      String(inv.product),
      inv.sizes.map((s) => ({ size: s.size, available: Math.max(0, s.stock - s.reserved) })),
    );
  }
  return map;
}

export interface InventorySizeRow {
  size: string;
  stock: number;
  reserved: number;
  available: number;
}

export interface InventoryProductGroup {
  productId: string;
  productSlug: string;
  title: string;
  color?: string;
  sku: string;
  sizes: InventorySizeRow[];
}

type PopulatedInventory = InventoryDoc & {
  _id: unknown;
  product: { _id: unknown; title?: string; slug?: string; color?: string } | unknown;
};

function toGroup(inv: PopulatedInventory): InventoryProductGroup {
  const product = inv.product as { _id?: unknown; title?: string; slug?: string; color?: string };
  return {
    productId: String(product?._id ?? inv.product),
    productSlug: product?.slug ?? "",
    title: product?.title ?? "—",
    color: product?.color ?? undefined,
    sku: inv.sku,
    sizes: inv.sizes
      .map((s) => ({ size: s.size, stock: s.stock, reserved: s.reserved, available: s.stock - s.reserved }))
      .sort((a, b) => a.size.localeCompare(b.size, "ru", { numeric: true })),
  };
}

export async function listInventory(): Promise<InventoryProductGroup[]> {
  const rows = await Inventory.find().populate("product", "title slug color").sort({ sku: 1 }).lean();
  return rows.map((row) => toGroup(row as never));
}

export async function setSizeStock(
  productId: string,
  size: string,
  stock: number,
): Promise<InventoryProductGroup> {
  if (stock < 0) throw new AppError("Остаток не может быть отрицательным", 400);

  const inv = await Inventory.findOne({ product: productId }).populate("product", "title slug color");
  if (!inv) throw new AppError("Позиция склада не найдена", 404);

  const row = inv.sizes.find((s) => s.size === size);
  if (!row) throw new AppError("Размер не найден — добавьте его сначала", 404);
  if (stock < row.reserved) {
    throw new AppError(
      `Нельзя установить остаток ниже зарезервированного (${row.reserved})`,
      409,
      "STOCK_BELOW_RESERVED",
    );
  }

  row.stock = stock;
  await inv.save();

  return toGroup(inv as never);
}

export async function addSizeRow(
  productId: string,
  size: string,
  stock: number,
): Promise<InventoryProductGroup> {
  if (stock < 0) throw new AppError("Остаток не может быть отрицательным", 400);
  const trimmedSize = size.trim();
  if (!trimmedSize) throw new AppError("Укажите размер", 400);

  const inv = await Inventory.findOne({ product: productId }).populate("product", "title slug color");
  if (!inv) throw new AppError("Позиция склада не найдена", 404);

  if (inv.sizes.some((s) => s.size === trimmedSize)) {
    throw new AppError("Этот размер уже добавлен", 409);
  }

  inv.sizes.push({ size: trimmedSize, stock, reserved: 0 });
  await inv.save();

  return toGroup(inv as never);
}

export async function removeSizeRow(productId: string, size: string): Promise<void> {
  const inv = await Inventory.findOne({ product: productId });
  if (!inv) throw new AppError("Позиция склада не найдена", 404);

  const row = inv.sizes.find((s) => s.size === size);
  if (row && row.reserved > 0) {
    throw new AppError("Нельзя удалить размер с зарезервированными единицами", 409);
  }

  inv.sizes = inv.sizes.filter((s) => s.size !== size) as typeof inv.sizes;
  await inv.save();
}
