// pages/api/dashboard/profileroute.js

import dbConnect from "@/vidyarishiapi/config/db";
import User from "@/vidyarishiapi/models/User";
import { verifyAccessToken } from "@/vidyarishiapi/utils/jwt";
import { errorHandler } from "@/vidyarishiapi/lib/errorHandler";
import AppError from "@/vidyarishiapi/lib/AppError";

async function handler(req, res) {
  // Only GET allowed for this endpoint
  if (req.method !== "GET") {
    throw new AppError("Only GET allowed", 405);
  }

  await dbConnect();

  // Read Bearer token from header
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    throw new AppError("Unauthorized", 401);
  }

  const decoded = verifyAccessToken(token);
  if (!decoded?.id) {
    throw new AppError("Invalid or expired token", 401);
  }

  const user = await User.findById(decoded.id).lean();
  if (!user) {
    throw new AppError("User not found", 404);
  }

  // remove sensitive fields if any
  const { password, __v, ...safeUser } = user;

  return res.status(200).json(safeUser);
}

export default errorHandler(handler);
