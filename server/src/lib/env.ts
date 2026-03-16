import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { z } from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const rawEnvSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  AUTO_PROCESS_QUEUE: z
    .string()
    .optional()
    .transform((value) => value !== "false"),
  CLIENT_ORIGIN: z.string().default("http://localhost:3000"),
  DATABASE_URL: z.string().optional(),
  SUPABASE_DATABASE_URL: z.string().optional(),
  DATABASE_SSL: z
    .string()
    .optional()
    .transform((value) => value === "true"),
  HEDERA_NETWORK: z.string().default("testnet"),
  HEDERA_ACCOUNT_ID: z.string().optional(),
  HEDERA_PRIVATE_KEY: z.string().optional(),
  HEDERA_REWARD_TOKEN_ID: z.string().optional(),
  HEDERA_TOPIC_ID: z.string().optional(),
  HEDERA_TOKEN_NAME: z.string().default("InVert Reward Token"),
  HEDERA_TOKEN_SYMBOL: z.string().default("IVRT"),
  HEDERA_TOKEN_DECIMALS: z.coerce.number().default(0),
  HEDERA_TOKEN_INITIAL_SUPPLY: z.coerce.number().default(1000000),
});

const rawEnv = rawEnvSchema.parse(process.env);
const databaseUrl =
  rawEnv.DATABASE_URL?.trim() || rawEnv.SUPABASE_DATABASE_URL?.trim();

if (!databaseUrl) {
  throw new Error("DATABASE_URL or SUPABASE_DATABASE_URL must be provided");
}

export const env = {
  ...rawEnv,
  DATABASE_URL: databaseUrl,
  DATABASE_SSL: rawEnv.DATABASE_SSL || (!!rawEnv.SUPABASE_DATABASE_URL && rawEnv.DATABASE_SSL === false),
};
