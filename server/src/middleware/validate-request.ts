import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";

export function validateRequest(schema: ZodTypeAny) {
  return (request: Request, _response: Response, next: NextFunction) => {
    const result = schema.parse({
      body: request.body,
      params: request.params,
      query: request.query,
    }) as {
      body: Request["body"];
      params: Request["params"];
      query: Request["query"];
    };

    request.body = result.body;
    request.params = result.params;
    next();
  };
}
