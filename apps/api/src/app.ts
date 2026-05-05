import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { ZodError } from "zod";
import { env } from "./env.js";
import { HttpError } from "./lib/http-error.js";
import { adminRouter } from "./routes/admin.js";
import { authRouter } from "./routes/auth.js";

export function createApp(): express.Express {
  const app = express();

  app.set("trust proxy", 1);
  app.use(
    cors({
      origin: env.CLIENT_ORIGIN,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());

  app.get("/health", (_request, response) => {
    response.json({ ok: true });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/admin", adminRouter);

  app.use((_request, response) => {
    response.status(404).json({ message: "Route not found" });
  });

  app.use(
    (
      error: unknown,
      _request: express.Request,
      response: express.Response,
      _next: express.NextFunction,
    ) => {
      if (error instanceof HttpError) {
        response.status(error.statusCode).json({ message: error.message });
        return;
      }

      if (error instanceof ZodError) {
        response.status(400).json({
          message: "Validation failed",
          issues: error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        });
        return;
      }

      if (
        error instanceof Error &&
        "code" in error &&
        (error as { code?: number }).code === 11000
      ) {
        response.status(409).json({ message: "Duplicate record" });
        return;
      }

      response.status(500).json({ message: "Unexpected server error" });
    },
  );

  return app;
}