import { actionsRouter } from "./actions.routes.js";
import { feedRouter } from "./feed.routes.js";
import { healthRouter } from "./health.routes.js";
import { leaderboardRouter } from "./leaderboard.routes.js";
import { uploadRouter } from "./upload.routes.js";
import { usersRouter } from "./users.routes.js";
import { verificationsRouter } from "./verifications.routes.js";
export function registerRoutes(app) {
    app.use("/api", healthRouter);
    app.use("/api", actionsRouter);
    app.use("/api", leaderboardRouter);
    app.use("/api", feedRouter);
    app.use("/api", usersRouter);
    app.use("/api", verificationsRouter);
    app.use("/api", uploadRouter);
}
