import { Schema, model, type InferSchemaType } from "mongoose";

const categorySchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    label: { type: String, required: true },
    sortOrder: { type: Number, required: true, default: 0 },
  },
  { timestamps: true },
);

export type CategoryDoc = InferSchemaType<typeof categorySchema>;
export const Category = model("Category", categorySchema);
