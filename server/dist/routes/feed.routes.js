import { Router } from "express";
import { actionsService } from "../services/actions.service.js";
export const feedRouter = Router();
feedRouter.get("/feed", async (_request, response) => {
    return response.json({
        items: await actionsService.getFeed(),
    });
});
