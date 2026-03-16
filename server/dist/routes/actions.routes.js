import { Router } from "express";
import { validateRequest } from "../middleware/validate-request.js";
import { actionStatusParamsSchema, createActionSchema, verifyActionSchema, } from "../schemas/action.schema.js";
import { actionsService } from "../services/actions.service.js";
import { queueService } from "../services/queue.service.js";
export const actionsRouter = Router();
actionsRouter.post("/actions", validateRequest(createActionSchema), async (request, response) => {
    const action = await actionsService.createAction(request.body);
    queueService.enqueue(action.id);
    return response.status(202).json({
        actionId: action.id,
        status: action.status,
        message: "Action submitted and queued for verification",
    });
});
actionsRouter.post("/verify", validateRequest(verifyActionSchema), async (request, response) => {
    const status = await actionsService.processVerification(request.body.actionId);
    return response.json(status);
});
actionsRouter.get("/actions/:id/status", validateRequest(actionStatusParamsSchema), async (request, response) => {
    const status = await actionsService.getActionStatus(String(request.params.id));
    return response.json(status);
});
