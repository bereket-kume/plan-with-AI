import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  JWT_ACCESS_SECRET: z.string().min(1, "JWT_ACCESS_SECRET is required"),
  JWT_REFRESH_SECRET: z.string().min(1, "JWT_REFRESH_SECRET is required"),
  CLIENT_ORIGIN: z.string().url().default("http://localhost:5173"),
  COOKIE_SECURE: z.string().optional(),
});

const parsedEnv = envSchema.parse(process.env);

export const env = {
  NODE_ENV: parsedEnv.NODE_ENV,
  PORT: parsedEnv.PORT,
  MONGODB_URI: parsedEnv.MONGODB_URI,
  JWT_ACCESS_SECRET: parsedEnv.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: parsedEnv.JWT_REFRESH_SECRET,
  CLIENT_ORIGIN: parsedEnv.CLIENT_ORIGIN,
  COOKIE_SECURE:
    parsedEnv.COOKIE_SECURE === "true" || parsedEnv.NODE_ENV === "production",
} as const;