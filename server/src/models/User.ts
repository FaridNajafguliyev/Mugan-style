import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "seller"], required: true, default: "seller" },
    isActive: { type: Boolean, required: true, default: true },
  },
  { timestamps: true },
);

export const User = model("User", userSchema);
