import { env } from "./config/env.js";
import { connectDb } from "./config/db.js";
import { createApp } from "./app.js";
import { startExpirePendingOrdersJob } from "./jobs/expirePendingOrders.job.js";

async function main() {
  await connectDb();
  const app = createApp();

  app.listen(env.PORT, () => {
    console.log(`[server] listening on http://localhost:${env.PORT}`);
  });

  startExpirePendingOrdersJob();
}

main().catch((err) => {
  console.error("[server] failed to start", err);
  process.exit(1);
});
