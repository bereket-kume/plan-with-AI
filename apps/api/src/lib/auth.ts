import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "../env.js";
import type { UserDocument, UserRole } from "../models/user.js";

export const refreshCookieName = "plan-with-ai.refresh-token";
export const refreshTokenLifetime = "7d";
export const accessTokenLifetime = "15m";

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  bio: string;
  avatarUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  refreshTokenHash: string;
}

export function serializeUser(user: UserDocument): PublicUser {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    bio: user.bio ?? "",
    avatarUrl: user.avatarUrl ?? "",
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export function signAccessToken(userId: string, role: UserRole): string {
  return jwt.sign({ role }, env.JWT_ACCESS_SECRET, {
    subject: userId,
    expiresIn: accessTokenLifetime,
  });
}

export function signRefreshToken(userId: string, role: UserRole): string {
  return jwt.sign({ role }, env.JWT_REFRESH_SECRET, {
    subject: userId,
    expiresIn: refreshTokenLifetime,
  });
}

export function verifyAccessToken(token: string): { userId: string; role: UserRole } {
  const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as jwt.JwtPayload;
  const userId = payload.sub;
  const role = payload.role;

  if (typeof userId !== "string" || (role !== "user" && role !== "admin")) {
    throw new Error("Invalid access token payload");
  }

  return { userId, role };
}

export function verifyRefreshToken(token: string): { userId: string; role: UserRole } {
  const payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as jwt.JwtPayload;
  const userId = payload.sub;
  const role = payload.role;

  if (typeof userId !== "string" || (role !== "user" && role !== "admin")) {
    throw new Error("Invalid refresh token payload");
  }

  return { userId, role };
}

export function fingerprintToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function buildTokenPair(userId: string, role: UserRole): TokenPair {
  const accessToken = signAccessToken(userId, role);
  const refreshToken = signRefreshToken(userId, role);

  return {
    accessToken,
    refreshToken,
    refreshTokenHash: fingerprintToken(refreshToken),
  };
}