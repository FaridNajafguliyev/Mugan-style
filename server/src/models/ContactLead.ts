import { Schema, model } from "mongoose";

const contactLeadSchema = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    model: { type: String },
    message: { type: String },
  },
  { timestamps: true },
);

export const ContactLead = model("ContactLead", contactLeadSchema);
