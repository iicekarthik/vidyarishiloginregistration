// pages/api/auth/refresh-token.js
import {
  verifyRefreshToken,
  generateAccessToken,
} from "@/vidyarishiapi/utils/jwt";
import User from "@/vidyarishiapi/models/User";
import dbConnect from "@/vidyarishiapi/config/db";
import { errorHandler } from "@/vidyarishiapi/lib/errorHandler";
import AppError from "@/vidyarishiapi/lib/AppError";

async function handler(req, res) {
  if (req.method !== "POST") {
    throw new AppError("Method not allowed", 405);
  }

  await dbConnect();

  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError("Refresh token required", 400);
  }

  const payload = await verifyRefreshToken(refreshToken);
  if (!payload) {
    throw new AppError("Invalid refresh token", 401);
  }

  const user = await User.findById(payload.id);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const newAccessToken = generateAccessToken(user);

  return res.status(200).json({
    accessToken: newAccessToken,
  });
}

export default errorHandler(handler);
