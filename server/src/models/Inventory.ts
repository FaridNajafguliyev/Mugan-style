import { Schema, model, type InferSchemaType } from "mongoose";

const sizeStockSchema = new Schema(
  {
    size: { type: String, required: true },
    stock: { type: Number, required: true, default: 0, min: 0 },
    reserved: { type: Number, required: true, default: 0, min: 0 },
  },
  { _id: false },
);

const inventorySchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true, unique: true },
    sku: { type: String, required: true, unique: true },
    sizes: { type: [sizeStockSchema], required: true, default: [] },
  },
  { timestamps: true },
);

export type InventoryDoc = InferSchemaType<typeof inventorySchema>;
export const Inventory = model("Inventory", inventorySchema);
