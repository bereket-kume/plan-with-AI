import { Router, type Router as ExpressRouter } from "express";
import { serializeUser } from "../lib/auth.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { User } from "../models/user.js";

const adminRouter: ExpressRouter = Router();

adminRouter.get(
  "/users",
  requireAuth,
  requireRole("admin"),
  async (_request, response, next) => {
    try {
      const users = await User.find()
        .sort({ createdAt: -1 })
        .select("name email role bio avatarUrl createdAt updatedAt");

      response.json({
        users: users.map((user) => serializeUser(user)),
      });
    } catch (error) {
      next(error);
    }
  },
);

export { adminRouter };