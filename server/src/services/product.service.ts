import { Product } from "../models/Product.js";
import { Inventory } from "../models/Inventory.js";
import { AppError } from "../utils/AppError.js";

export interface ProductDto {
  id: string;
  category: string;
  categoryLabel: string;
  title: string;
  material: string;
  lining: string;
  sizes: string;
  priceKopecks: number;
  priceFrom: boolean;
  description: string;
  images: string[];
  available: number;
}

async function toDto(product: {
  _id: unknown;
  slug: string;
  category: { key: string } | unknown;
  categoryLabel: string;
  title: string;
  material: string;
  lining: string;
  sizes: string;
  priceKopecks: number;
  priceFrom: boolean;
  description: string;
  images: string[];
}): Promise<ProductDto> {
  const inventory = await Inventory.findOne({ product: product._id }).lean();
  const available = inventory ? inventory.stock - inventory.reserved : 0;
  const categoryKey =
    typeof product.category === "object" && product.category && "key" in product.category
      ? (product.category as { key: string }).key
      : String(product.category);

  return {
    id: product.slug,
    category: categoryKey,
    categoryLabel: product.categoryLabel,
    title: product.title,
    material: product.material,
    lining: product.lining,
    sizes: product.sizes,
    priceKopecks: product.priceKopecks,
    priceFrom: product.priceFrom,
    description: product.description,
    images: product.images,
    available,
  };
}

export async function listProducts(params: { category?: string; limit?: number }): Promise<ProductDto[]> {
  const query: Record<string, unknown> = { isActive: true };

  const products = await Product.find(query).populate("category", "key").sort({ createdAt: 1 }).lean();

  const filtered = params.category && params.category !== "all"
    ? products.filter((p) => (p.category as unknown as { key: string })?.key === params.category)
    : products;

  const limited = params.limit ? filtered.slice(0, params.limit) : filtered;

  return Promise.all(limited.map((p) => toDto(p as never)));
}

export async function getProductBySlug(slug: string): Promise<ProductDto> {
  const product = await Product.findOne({ slug, isActive: true }).populate("category", "key").lean();
  if (!product) throw new AppError("Product not found", 404);
  return toDto(product as never);
}
