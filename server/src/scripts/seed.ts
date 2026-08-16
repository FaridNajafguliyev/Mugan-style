import { connectDb } from "../config/db.js";
import { Category } from "../models/Category.js";
import { Product } from "../models/Product.js";
import { Inventory } from "../models/Inventory.js";
import { categoriesSeed } from "../seed/categories.seed.js";
import { productsSeed } from "../seed/products.seed.js";
import mongoose from "mongoose";

async function run() {
  await connectDb();

  const categoryByKey = new Map<string, mongoose.Types.ObjectId>();
  for (const cat of categoriesSeed) {
    const doc = await Category.findOneAndUpdate(
      { key: cat.key },
      { $set: { label: cat.label, sortOrder: cat.sortOrder } },
      { upsert: true, new: true },
    );
    categoryByKey.set(cat.key, doc._id);
  }
  console.log(`[seed] upserted ${categoryByKey.size} categories`);

  let productCount = 0;
  for (const p of productsSeed) {
    const categoryId = categoryByKey.get(p.categoryKey);
    if (!categoryId) throw new Error(`Unknown category key: ${p.categoryKey}`);

    const product = await Product.findOneAndUpdate(
      { slug: p.slug },
      {
        $set: {
          slug: p.slug,
          category: categoryId,
          categoryLabel: p.categoryLabel,
          title: p.title,
          material: p.material,
          lining: p.lining,
          sizes: p.sizes,
          priceKopecks: p.priceKopecks,
          priceFrom: p.priceFrom,
          description: p.description,
          images: p.images,
          isActive: true,
        },
      },
      { upsert: true, new: true },
    );

    await Inventory.findOneAndUpdate(
      { product: product._id },
      {
        $setOnInsert: {
          product: product._id,
          sku: p.slug.toUpperCase(),
          stock: p.stock,
          reserved: 0,
        },
      },
      { upsert: true },
    );

    productCount += 1;
  }
  console.log(`[seed] upserted ${productCount} products + inventory rows`);

  await mongoose.disconnect();
  console.log("[seed] done");
}

run().catch((err) => {
  console.error("[seed] failed", err);
  process.exit(1);
});
