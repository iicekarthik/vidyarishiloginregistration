// pages/api/dashboard/update-profile-info.js
import dbConnect from "@/vidyarishiapi/config/db";
import User from "@/vidyarishiapi/models/User";
import {
  verifyAccessToken,
  verifyRefreshToken,
  generateAccessToken,
} from "@/vidyarishiapi/utils/jwt";
import { errorHandler } from "@/vidyarishiapi/lib/errorHandler";
import AppError from "@/vidyarishiapi/lib/AppError";
import { parse } from "cookie";

const isProd = process.env.NODE_ENV === "production";
const cookieSettings = isProd
  ? "Max-Age=1200; HttpOnly; Path=/; SameSite=None; Secure"
  : "Max-Age=1200; HttpOnly; Path=/; SameSite=Lax";

async function handler(req, res) {
  if (req.method !== "POST") {
    throw new AppError("Only POST allowed", 405);
  }

  // Parse cookies
  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
  const accessToken = cookies.accessToken;
  const refreshToken = cookies.refreshToken;

  // Validate access token
  let userPayload = accessToken ? verifyAccessToken(accessToken) : null;

  // If expired → try refresh token
  if (!userPayload && refreshToken) {
    const refreshPayload = await verifyRefreshToken(refreshToken);
    if (!refreshPayload) throw new AppError("Unauthorized", 401);

    const newAccessToken = generateAccessToken({ _id: refreshPayload.id });
    res.setHeader("Set-Cookie", `accessToken=${newAccessToken}; ${cookieSettings};`);
    userPayload = { id: refreshPayload.id };
  }

  if (!userPayload?.id) {
    throw new AppError("Unauthorized", 401);
  }

  await dbConnect();

  const { firstName, lastName, phone, skill, biography } = req.body || {};
  const update = {};

  // Build fullName only if any name part provided
  if (firstName !== undefined || lastName !== undefined) {
    const fullName = `${firstName || ""} ${lastName || ""}`.trim();
    if (fullName) update.fullName = fullName;
  }

  if (phone !== undefined) update.phone = phone;
  if (skill !== undefined) update.skill = skill;
  if (biography !== undefined) update.biography = biography;

  if (Object.keys(update).length === 0) {
    throw new AppError("No valid fields to update", 400);
  }

  const user = await User.findByIdAndUpdate(userPayload.id, update, { new: true }).lean();
  if (!user) throw new AppError("User not found", 404);

  return res.status(200).json({ status: "success", user });
}

export default errorHandler(handler);
