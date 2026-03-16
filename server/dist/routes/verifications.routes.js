import { Router } from "express";
import { actionsService } from "../services/actions.service.js";
export const verificationsRouter = Router();
verificationsRouter.get("/verifications", async (_request, response) => {
    return response.json({
        items: await actionsService.getRecentVerifications(),
    });
});
