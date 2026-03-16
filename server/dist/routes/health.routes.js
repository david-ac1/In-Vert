import { Router } from "express";
import { env } from "../lib/env.js";
export const healthRouter = Router();
healthRouter.get("/health", (_request, response) => {
    return response.json({
        status: "ok",
        environment: env.NODE_ENV,
        network: env.HEDERA_NETWORK,
    });
});
