import { Router } from "express";
import { actionsService } from "../services/actions.service.js";
export const leaderboardRouter = Router();
leaderboardRouter.get("/leaderboard", async (_request, response) => {
    return response.json({
        contributors: await actionsService.getLeaderboard(),
    });
});
