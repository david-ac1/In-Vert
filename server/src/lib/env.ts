import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  AUTO_PROCESS_QUEUE: z
    .string()
    .optional()
    .transform((value) => value !== "false"),
  CLIENT_ORIGIN: z.string().default("http://localhost:3000"),
  HEDERA_NETWORK: z.string().default("testnet"),
  HEDERA_ACCOUNT_ID: z.string().optional(),
  HEDERA_PRIVATE_KEY: z.string().optional(),
  HEDERA_REWARD_TOKEN_ID: z.string().optional(),
  HEDERA_TOPIC_ID: z.string().optional(),
});

export const env = envSchema.parse(process.env);
