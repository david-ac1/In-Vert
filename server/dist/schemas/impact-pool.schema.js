import { z } from "zod";
export const createImpactPoolSchema = z.object({
    body: z.object({
        targetActions: z.number().int().positive().max(1000).optional(),
        title: z.string().min(3).max(120).optional(),
    }),
    params: z.object({}),
    query: z.object({}),
});
export const impactPoolParamsSchema = z.object({
    body: z.object({}),
    params: z.object({
        id: z.string().min(3),
    }),
    query: z.object({}),
});
