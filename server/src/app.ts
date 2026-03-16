import cors from "cors";
import express from "express";
import { registerRoutes } from "./routes/index.js";
import { errorHandler } from "./middleware/error-handler.js";
import { notFoundHandler } from "./middleware/not-found.js";
import { env } from "./lib/env.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.CLIENT_ORIGIN,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "2mb" }));

  registerRoutes(app);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
