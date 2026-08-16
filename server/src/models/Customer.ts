import { Schema, model } from "mongoose";

const customerSchema = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true, index: true },
    email: { type: String },
  },
  { timestamps: true },
);

export const Customer = model("Customer", customerSchema);
