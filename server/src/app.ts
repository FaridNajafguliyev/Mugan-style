import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import apiRoutes from "./routes/index.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.middleware.js";
import { LOCAL_UPLOADS_DIR } from "./services/upload.service.js";

export function createApp() {
  const app = express();

  // Render puts the app behind its own reverse proxy, so the connecting
  // socket IP is always Render's, not the client's — without this,
  // express-rate-limit can't trust X-Forwarded-For and throws on every
  // request instead of rate-limiting by real client IP.
  app.set("trust proxy", 1);

  app.use(
    helmet({
      // This API serves no HTML of its own — only JSON and product-image
      // files under /uploads — so a strict default CSP would just block
      // the frontend's own <img> tags from loading them with no benefit.
      crossOriginResourcePolicy: { policy: "cross-origin" },
      contentSecurityPolicy: false,
    }),
  );
  app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
  app.use(cookieParser());
  app.use(express.json());

  app.use("/uploads", express.static(LOCAL_UPLOADS_DIR));
  app.use("/api", apiRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
