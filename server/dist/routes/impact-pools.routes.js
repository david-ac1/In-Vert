import { Router } from "express";
import { validateRequest } from "../middleware/validate-request.js";
import { createImpactPoolSchema, impactPoolParamsSchema, } from "../schemas/impact-pool.schema.js";
import { impactPoolsService } from "../services/impact-pools.service.js";
export const impactPoolsRouter = Router();
impactPoolsRouter.get("/impact-pools", async (_request, response) => {
    return response.json({
        items: await impactPoolsService.listPools(),
    });
});
impactPoolsRouter.post("/impact-pools", validateRequest(createImpactPoolSchema), async (request, response) => {
    const pool = await impactPoolsService.createPool(request.body);
    return response.status(201).json(pool);
});
impactPoolsRouter.get("/impact-pools/:id", validateRequest(impactPoolParamsSchema), async (request, response) => {
    const pool = await impactPoolsService.getPoolById(String(request.params.id));
    return response.json(pool);
});
impactPoolsRouter.get("/impact-pools/:id/export", validateRequest(impactPoolParamsSchema), async (request, response) => {
    const proof = await impactPoolsService.exportPoolProof(String(request.params.id));
    return response.json(proof);
});
