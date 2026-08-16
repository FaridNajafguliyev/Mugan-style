import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  CLIENT_URL: z.string().default("http://localhost:5173"),

  MONGODB_URI: z.string().min(1),

  JWT_ACCESS_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),
  JWT_ACCESS_EXPIRES: z.string().default("15m"),
  JWT_REFRESH_EXPIRES: z.string().default("30d"),

  YOOKASSA_SHOP_ID: z.string().default(""),
  YOOKASSA_SECRET_KEY: z.string().default(""),
  YOOKASSA_RETURN_URL: z.string().default("http://localhost:5173/order/:orderNumber/result"),

  ADMIN_SEED_EMAIL: z.string().optional(),
  ADMIN_SEED_PASSWORD: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;
