import { env } from "../lib/env.js";
import { logger } from "../lib/logger.js";
import { actionsService } from "./actions.service.js";

class QueueService {
  enqueue(actionId: string) {
    logger.info("Queued action for verification", { actionId });

    if (env.AUTO_PROCESS_QUEUE) {
      setTimeout(() => {
        void actionsService.processVerification(actionId);
      }, 250);
    }
  }
}

export const queueService = new QueueService();
