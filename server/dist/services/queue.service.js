import { env } from "../lib/env.js";
import { logger } from "../lib/logger.js";
import { actionsService } from "./actions.service.js";
class QueueService {
    enqueue(actionId) {
        logger.info("Queued action for verification", { actionId });
        if (env.AUTO_PROCESS_QUEUE) {
            setTimeout(() => {
                void actionsService.processVerification(actionId).catch((error) => {
                    logger.error("Queued verification failed", {
                        actionId,
                        error: error instanceof Error ? error.message : String(error),
                    });
                });
            }, 250);
        }
    }
}
export const queueService = new QueueService();
