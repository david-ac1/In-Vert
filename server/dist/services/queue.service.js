import { env } from "../lib/env.js";
import { logger } from "../lib/logger.js";
import { actionsRepository } from "../repositories/actions.repository.js";
import { actionsService } from "./actions.service.js";
class QueueService {
    processing = false;
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
    startBackgroundProcessor() {
        if (!env.AUTO_PROCESS_QUEUE) {
            logger.info("Queue auto-processing disabled", { AUTO_PROCESS_QUEUE: env.AUTO_PROCESS_QUEUE });
            return;
        }
        // Sweep queued actions to recover jobs missed by process restarts/timeouts.
        setInterval(() => {
            void this.processPendingQueue().catch((error) => {
                logger.error("Queue sweep failed", {
                    error: error instanceof Error ? error.message : String(error),
                });
            });
        }, 10_000);
    }
    async processPendingQueue() {
        if (this.processing) {
            return;
        }
        this.processing = true;
        try {
            const actionIds = await actionsRepository.listQueuedActionIds(25);
            if (actionIds.length === 0) {
                return;
            }
            logger.info("Queue sweep picked queued actions", { count: actionIds.length });
            for (const actionId of actionIds) {
                await actionsService.processVerification(actionId);
            }
        }
        finally {
            this.processing = false;
        }
    }
}
export const queueService = new QueueService();
