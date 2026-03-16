import { Router } from "express";
import { actionsService } from "../services/actions.service.js";
export const feedRouter = Router();
feedRouter.get("/feed", (_request, response) => {
    return response.json({
        items: actionsService.getFeed(),
    });
});
