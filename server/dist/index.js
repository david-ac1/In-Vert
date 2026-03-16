import { createApp } from "./app.js";
import { env } from "./lib/env.js";
import { logger } from "./lib/logger.js";
const app = createApp();
app.listen(env.PORT, () => {
    logger.info(`In-Vert server listening on port ${env.PORT}`);
});
