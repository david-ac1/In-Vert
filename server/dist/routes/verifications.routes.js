import { Router } from "express";
import { validateRequest } from "../middleware/validate-request.js";
import { actionStatusParamsSchema } from "../schemas/action.schema.js";
import { actionsService } from "../services/actions.service.js";
export const verificationsRouter = Router();
verificationsRouter.get("/verifications", async (_request, response) => {
    return response.json({
        items: await actionsService.getRecentVerifications(),
    });
});
verificationsRouter.get("/protocol/stats", async (_request, response) => {
    return response.json(await actionsService.getProtocolStats());
});
verificationsRouter.get("/protocol/attestations/:id", validateRequest(actionStatusParamsSchema), async (request, response) => {
    const attestation = await actionsService.getProtocolAttestation(String(request.params.id));
    return response.json(attestation);
});
