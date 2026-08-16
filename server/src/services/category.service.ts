import { Category } from "../models/Category.js";

export async function listCategories() {
  const categories = await Category.find().sort({ sortOrder: 1 }).lean();
  return categories.map((c) => ({ key: c.key, label: c.label }));
}
