import bcrypt from "bcryptjs";
import { type CookieOptions, Router, type Router as ExpressRouter, type Response } from "express";
import { z } from "zod";
import { env } from "../env.js";
import { HttpError } from "../lib/http-error.js";
import {
  buildTokenPair,
  fingerprintToken,
  refreshCookieName,
  serializeUser,
  verifyRefreshToken,
} from "../lib/auth.js";
import { requireAuth } from "../middleware/auth.js";
import { User } from "../models/user.js";

const authRouter: ExpressRouter = Router();

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(128),
});

const loginSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(128),
});

const profileSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  email: z.string().trim().email().transform((value) => value.toLowerCase()).optional(),
  bio: z.string().trim().max(320).optional(),
  avatarUrl: z.string().trim().url().max(500).or(z.literal("")).optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(8).max(128),
  newPassword: z.string().min(8).max(128),
});

const tokenCookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: env.COOKIE_SECURE,
  path: "/api/auth",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

function setRefreshCookie(response: Response, refreshToken: string) {
  response.cookie(refreshCookieName, refreshToken, tokenCookieOptions);
}

function clearRefreshCookie(response: Response) {
  response.clearCookie(refreshCookieName, {
    ...tokenCookieOptions,
    maxAge: undefined,
  });
}

async function issueSession(userId: string, role: "user" | "admin") {
  const tokenPair = buildTokenPair(userId, role);

  await User.updateOne(
    { _id: userId },
    { $set: { refreshTokenHash: tokenPair.refreshTokenHash } },
  );

  return tokenPair;
}

authRouter.post("/register", async (request, response, next) => {
  try {
    const payload = registerSchema.parse(request.body);
    const existingUser = await User.findOne({ email: payload.email });

    if (existingUser) {
      throw new HttpError(409, "An account with that email already exists");
    }

    const userCount = await User.countDocuments();
    const passwordHash = await bcrypt.hash(payload.password, 12);
    const user = await User.create({
      name: payload.name,
      email: payload.email,
      passwordHash,
      role: userCount === 0 ? "admin" : "user",
      bio: "",
      avatarUrl: "",
      refreshTokenHash: null,
    });

    const session = await issueSession(user.id, user.role);
    setRefreshCookie(response, session.refreshToken);

    response.status(201).json({
      user: serializeUser(user),
      accessToken: session.accessToken,
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/login", async (request, response, next) => {
  try {
    const payload = loginSchema.parse(request.body);
    const user = await User.findOne({ email: payload.email }).select(
      "+passwordHash +refreshTokenHash",
    );

    if (!user) {
      throw new HttpError(401, "Invalid email or password");
    }

    const passwordMatches = await bcrypt.compare(payload.password, user.passwordHash);
    if (!passwordMatches) {
      throw new HttpError(401, "Invalid email or password");
    }

    const session = await issueSession(user.id, user.role);
    setRefreshCookie(response, session.refreshToken);

    response.json({
      user: serializeUser(user),
      accessToken: session.accessToken,
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/session", async (request, response, next) => {
  try {
    const refreshToken = request.cookies?.[refreshCookieName] as string | undefined;

    if (!refreshToken) {
      throw new HttpError(401, "No active session found");
    }

    const payload = verifyRefreshToken(refreshToken);
    const user = await User.findById(payload.userId).select(
      "+passwordHash +refreshTokenHash",
    );

    if (!user || user.refreshTokenHash !== fingerprintToken(refreshToken)) {
      throw new HttpError(401, "Session expired. Please sign in again");
    }

    const session = await issueSession(user.id, user.role);
    setRefreshCookie(response, session.refreshToken);

    response.json({
      user: serializeUser(user),
      accessToken: session.accessToken,
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/logout", async (request, response, next) => {
  try {
    const refreshToken = request.cookies?.[refreshCookieName] as string | undefined;

    if (refreshToken) {
      try {
        const payload = verifyRefreshToken(refreshToken);
        await User.updateOne(
          { _id: payload.userId },
          { $set: { refreshTokenHash: null } },
        );
      } catch {
        // Ignore invalid refresh tokens during logout.
      }
    }

    clearRefreshCookie(response);
    response.status(204).send();
  } catch (error) {
    next(error);
  }
});

authRouter.get("/me", requireAuth, async (request, response, next) => {
  try {
    const user = await User.findById(request.auth?.userId);

    if (!user) {
      throw new HttpError(404, "User profile not found");
    }

    response.json({ user: serializeUser(user) });
  } catch (error) {
    next(error);
  }
});

authRouter.patch("/me", requireAuth, async (request, response, next) => {
  try {
    const payload = profileSchema.parse(request.body);
    const userId = request.auth?.userId;

    if (!userId) {
      throw new HttpError(401, "Authentication required");
    }

    const updates: Record<string, string> = {};

    if (payload.name !== undefined) {
      updates.name = payload.name;
    }

    if (payload.bio !== undefined) {
      updates.bio = payload.bio;
    }

    if (payload.avatarUrl !== undefined) {
      updates.avatarUrl = payload.avatarUrl;
    }

    if (payload.email !== undefined) {
      const existingUser = await User.findOne({ email: payload.email, _id: { $ne: userId } });
      if (existingUser) {
        throw new HttpError(409, "That email address is already in use");
      }

      updates.email = payload.email;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true },
    );

    if (!user) {
      throw new HttpError(404, "User profile not found");
    }

    response.json({ user: serializeUser(user) });
  } catch (error) {
    next(error);
  }
});

authRouter.patch("/password", requireAuth, async (request, response, next) => {
  try {
    const payload = passwordSchema.parse(request.body);
    const userId = request.auth?.userId;

    if (!userId) {
      throw new HttpError(401, "Authentication required");
    }

    const user = await User.findById(userId).select(
      "+passwordHash +refreshTokenHash",
    );

    if (!user) {
      throw new HttpError(404, "User profile not found");
    }

    const currentPasswordMatches = await bcrypt.compare(
      payload.currentPassword,
      user.passwordHash,
    );

    if (!currentPasswordMatches) {
      throw new HttpError(401, "Current password is incorrect");
    }

    user.passwordHash = await bcrypt.hash(payload.newPassword, 12);
    user.refreshTokenHash = null;
    await user.save();

    clearRefreshCookie(response);
    response.json({ message: "Password updated. Please sign in again." });
  } catch (error) {
    next(error);
  }
});

export { authRouter };