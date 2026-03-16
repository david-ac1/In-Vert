import type { Express } from "express";
import { actionsRouter } from "./actions.routes.js";
import { feedRouter } from "./feed.routes.js";
import { healthRouter } from "./health.routes.js";
import { leaderboardRouter } from "./leaderboard.routes.js";
import { usersRouter } from "./users.routes.js";
import { verificationsRouter } from "./verifications.routes.js";

export function registerRoutes(app: Express) {
  app.use("/api", healthRouter);
  app.use("/api", actionsRouter);
  app.use("/api", leaderboardRouter);
  app.use("/api", feedRouter);
  app.use("/api", usersRouter);
  app.use("/api", verificationsRouter);
}
