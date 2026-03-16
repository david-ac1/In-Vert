import { z } from "zod";

export const createActionSchema = z.object({
  body: z.object({
    actionType: z.string().min(2),
    description: z.string().min(3),
    quantity: z.number().int().positive().max(10000),
    location: z.string().min(2),
    photoUrl: z.string().url(),
    walletAddress: z.string().min(8),
    username: z.string().min(2),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const verifyActionSchema = z.object({
  body: z.object({
    actionId: z.string().min(3),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const actionStatusParamsSchema = z.object({
  body: z.object({}),
  params: z.object({
    id: z.string().min(3),
  }),
  query: z.object({}),
});

export const userParamsSchema = z.object({
  body: z.object({}),
  params: z.object({
    id: z.string().min(3),
  }),
  query: z.object({}),
});
