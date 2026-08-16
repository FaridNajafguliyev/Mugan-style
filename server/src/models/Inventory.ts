import { Schema, model, type InferSchemaType } from "mongoose";

const inventorySchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true, unique: true },
    sku: { type: String, required: true, unique: true },
    stock: { type: Number, required: true, default: 0, min: 0 },
    reserved: { type: Number, required: true, default: 0, min: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

inventorySchema.virtual("available").get(function (this: { stock: number; reserved: number }) {
  return this.stock - this.reserved;
});

export type InventoryDoc = InferSchemaType<typeof inventorySchema>;
export const Inventory = model("Inventory", inventorySchema);
