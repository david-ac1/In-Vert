import { createApp } from "./app.js";
import { env } from "./lib/env.js";
import { logger } from "./lib/logger.js";
import { queueService } from "./services/queue.service.js";
process.on("uncaughtException", (error) => {
    logger.error("Uncaught exception — server kept alive", { error: error.message });
});
process.on("unhandledRejection", (reason) => {
    logger.error("Unhandled promise rejection — server kept alive", {
        reason: reason instanceof Error ? reason.message : String(reason),
    });
});
const app = createApp();
app.listen(env.PORT, () => {
    logger.info(`In-Vert server listening on port ${env.PORT}`);
    queueService.startBackgroundProcessor();
});
