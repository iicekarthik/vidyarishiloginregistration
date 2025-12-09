// pages/api/auth/logout.js
import dbConnect from "@/vidyarishiapi/config/db";
import RefreshToken from "@/vidyarishiapi/models/RefreshToken";
import { errorHandler } from "@/vidyarishiapi/lib/errorHandler";
import AppError from "@/vidyarishiapi/lib/AppError";

async function handler(req, res) {
  if (req.method !== "POST") {
    throw new AppError("Only POST allowed", 405);
  }

  await dbConnect();

  const { refreshToken } = req.body;
  if (!refreshToken) {
    throw new AppError("Refresh token required", 400);
  }

  await RefreshToken.deleteOne({ token: refreshToken });

  return res.status(200).json({ message: "Logged out" });
}

export default errorHandler(handler);
