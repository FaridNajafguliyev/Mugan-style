import { Product } from "../models/Product.js";
import { Inventory } from "../models/Inventory.js";
import { Category } from "../models/Category.js";
import { Order } from "../models/Order.js";
import { AppError } from "../utils/AppError.js";
import { slugify } from "../utils/slugify.js";

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

export interface AdminProductDto {
  id: string;
  categoryKey: string;
  categoryLabel: string;
  title: string;
  material: string;
  lining: string;
  sizes: string;
  priceKopecks: number;
  priceFrom: boolean;
  description: string;
  images: string[];
  isActive: boolean;
  stock: number;
  reserved: number;
  available: number;
}

async function toAdminDto(slug: string): Promise<AdminProductDto> {
  const product = await Product.findOne({ slug }).populate("category", "key").lean();
  if (!product) throw new AppError("Товар не найден", 404);

  const inventory = await Inventory.findOne({ product: product._id }).lean();
  const categoryKey = (product.category as unknown as { key?: string })?.key ?? String(product.category);

  return {
    id: product.slug,
    categoryKey,
    categoryLabel: product.categoryLabel,
    title: product.title,
    material: product.material,
    lining: product.lining,
    sizes: product.sizes,
    priceKopecks: product.priceKopecks,
    priceFrom: product.priceFrom,
    description: product.description,
    images: product.images,
    isActive: product.isActive,
    stock: inventory?.stock ?? 0,
    reserved: inventory?.reserved ?? 0,
    available: inventory ? inventory.stock - inventory.reserved : 0,
  };
}

export async function listProductsAdmin(): Promise<AdminProductDto[]> {
  const products = await Product.find().sort({ createdAt: -1 }).lean();
  return Promise.all(products.map((p) => toAdminDto(p.slug)));
}

export interface ProductInput {
  categoryKey: string;
  title: string;
  material: string;
  lining: string;
  sizes: string;
  priceKopecks: number;
  priceFrom: boolean;
  description: string;
  images: string[];
}

export async function createProduct(
  input: ProductInput & { initialStock: number },
): Promise<AdminProductDto> {
  const category = await Category.findOne({ key: input.categoryKey });
  if (!category) throw new AppError("Категория не найдена", 400);

  const baseSlug = slugify(input.title);
  if (!baseSlug) throw new AppError("Некорректное название товара", 400);

  let slug = baseSlug;
  let suffix = 2;
  while (await Product.exists({ slug })) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  const product = await Product.create({
    slug,
    category: category._id,
    categoryLabel: category.label,
    title: input.title,
    material: input.material,
    lining: input.lining,
    sizes: input.sizes,
    priceKopecks: input.priceKopecks,
    priceFrom: input.priceFrom,
    description: input.description,
    images: input.images,
    isActive: true,
  });

  await Inventory.create({
    product: product._id,
    sku: slug.toUpperCase(),
    stock: input.initialStock,
    reserved: 0,
  });

  return toAdminDto(slug);
}

export async function updateProduct(
  slug: string,
  input: Partial<ProductInput> & { isActive?: boolean },
): Promise<AdminProductDto> {
  const product = await Product.findOne({ slug });
  if (!product) throw new AppError("Товар не найден", 404);

  if (input.categoryKey) {
    const category = await Category.findOne({ key: input.categoryKey });
    if (!category) throw new AppError("Категория не найдена", 400);
    product.category = category._id;
    product.categoryLabel = category.label;
  }
  if (input.title !== undefined) product.title = input.title;
  if (input.material !== undefined) product.material = input.material;
  if (input.lining !== undefined) product.lining = input.lining;
  if (input.sizes !== undefined) product.sizes = input.sizes;
  if (input.priceKopecks !== undefined) product.priceKopecks = input.priceKopecks;
  if (input.priceFrom !== undefined) product.priceFrom = input.priceFrom;
  if (input.description !== undefined) product.description = input.description;
  if (input.images !== undefined) product.images = input.images;
  if (input.isActive !== undefined) product.isActive = input.isActive;

  await product.save();
  return toAdminDto(product.slug);
}

export async function deleteProduct(slug: string): Promise<void> {
  const product = await Product.findOne({ slug });
  if (!product) throw new AppError("Товар не найден", 404);

  const hasOrders = await Order.exists({ "items.product": product._id });
  if (hasOrders) {
    throw new AppError(
      "Нельзя удалить товар, по которому уже есть заказы — скройте его вместо этого",
      409,
      "PRODUCT_HAS_ORDERS",
    );
  }

  await Inventory.deleteOne({ product: product._id });
  await Product.deleteOne({ _id: product._id });
}
