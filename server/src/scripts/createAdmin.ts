import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDb } from "../config/db.js";
import { env } from "../config/env.js";
import { User } from "../models/User.js";

async function run() {
  const email = env.ADMIN_SEED_EMAIL;
  const password = env.ADMIN_SEED_PASSWORD;

  if (!email || !password) {
    console.error("[seed:admin] ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD must be set in server/.env");
    process.exit(1);
  }

  await connectDb();

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    console.log(`[seed:admin] user ${email} already exists — nothing to do`);
  } else {
    const passwordHash = await bcrypt.hash(password, 12);
    await User.create({ name: "Admin", email: email.toLowerCase(), passwordHash, role: "admin" });
    console.log(`[seed:admin] created admin user ${email}`);
  }

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("[seed:admin] failed", err);
  process.exit(1);
});
