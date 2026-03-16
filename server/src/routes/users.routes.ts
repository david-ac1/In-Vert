import { Router } from "express";
import { validateRequest } from "../middleware/validate-request.js";
import { userParamsSchema } from "../schemas/action.schema.js";
import { actionsService } from "../services/actions.service.js";

export const usersRouter = Router();

usersRouter.get("/users/:id", validateRequest(userParamsSchema), (request, response) => {
  return response.json(actionsService.getUserProfile(String(request.params.id)));
});
