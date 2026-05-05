import {
  type HydratedDocument,
  model,
  models,
  Schema,
  type Types,
} from "mongoose";

export type UserRole = "user" | "admin";

export interface UserProfile {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  bio: string;
  avatarUrl: string;
  refreshTokenHash: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type UserDocument = HydratedDocument<UserProfile>;

const userSchema = new Schema<UserProfile>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      required: true,
    },
    bio: {
      type: String,
      default: "",
      maxlength: 320,
    },
    avatarUrl: {
      type: String,
      default: "",
      maxlength: 500,
    },
    refreshTokenHash: {
      type: String,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const User = models.User ?? model<UserProfile>("User", userSchema);