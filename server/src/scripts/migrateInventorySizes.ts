// One-time migration: converts the old flat Inventory.{stock,reserved} shape
// to the new Inventory.sizes[] breakdown. Seeds one row per discrete size
// parsed from the product's display range (e.g. "44–52" -> 44,46,48,50,52),
// all starting at 0 — real per-size counts are filled in afterwards on the
// admin Склад page, never guessed here.
import mongoose from "mongoose";
import { connectDb } from "../config/db.js";
import { Inventory } from "../models/Inventory.js";
import { Product } from "../models/Product.js";

function parseSizeRange(sizesText: string): string[] {
  const match = sizesText.match(/(\d+)\s*[–-]\s*(\d+)/);
  if (!match) return [];
  const start = Number(match[1]);
  const end = Number(match[2]);
  const sizes: string[] = [];
  for (let s = start; s <= end; s += 2) sizes.push(String(s));
  return sizes;
}

async function run() {
  await connectDb();

  const rows = await Inventory.find().lean();
  let migrated = 0;
  let skipped = 0;

  for (const row of rows) {
    const legacy = row as unknown as { stock?: number; reserved?: number; sizes?: unknown[] };
    if (Array.isArray(legacy.sizes) && legacy.sizes.length > 0) {
      skipped += 1;
      continue;
    }

    const product = await Product.findById(row.product).lean();
    const discreteSizes = product ? parseSizeRange(product.sizes) : [];

    if (discreteSizes.length === 0) {
      console.warn(`[migrate:inventory-sizes] could not parse sizes for product ${row.product} — skipping`);
      skipped += 1;
      continue;
    }

    await Inventory.updateOne(
      { _id: row._id },
      {
        $set: { sizes: discreteSizes.map((size) => ({ size, stock: 0, reserved: 0 })) },
        $unset: { stock: "", reserved: "" },
      },
    );
    migrated += 1;
    console.log(`[migrate:inventory-sizes] ${product?.title ?? row.product}: seeded sizes ${discreteSizes.join(", ")}`);
  }

  console.log(`[migrate:inventory-sizes] done — migrated ${migrated}, skipped ${skipped}`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("[migrate:inventory-sizes] failed", err);
  process.exit(1);
});
