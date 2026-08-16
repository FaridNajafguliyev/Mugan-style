import { Schema, model, type InferSchemaType } from "mongoose";

const productSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    categoryLabel: { type: String, required: true },
    title: { type: String, required: true },
    material: { type: String, required: true },
    lining: { type: String, required: true },
    sizes: { type: String, required: true },
    priceKopecks: { type: Number, required: true, min: 0 },
    priceFrom: { type: Boolean, required: true, default: true },
    description: { type: String, required: true },
    images: { type: [String], required: true, default: [] },
    isActive: { type: Boolean, required: true, default: true },
  },
  { timestamps: true },
);

export type ProductDoc = InferSchemaType<typeof productSchema>;
export const Product = model("Product", productSchema);
