import {
  verifyRefreshToken,
  generateAccessToken,
} from "@/vidyarishiapi/utils/jwt";
import User from "@/vidyarishiapi/models/User";
import dbConnect from "@/vidyarishiapi/config/db";
import { errorHandler } from "@/vidyarishiapi/lib/errorHandler";
import AppError from "@/vidyarishiapi/lib/AppError";
import { parse } from "cookie";

const isProd = process.env.NODE_ENV === "production";

const accessTokenCookie = token =>
  `accessToken=${token}; Max-Age=1200; HttpOnly; Path=/; ${
    isProd ? "SameSite=None; Secure" : "SameSite=Lax"
  }`;

async function handler(req, res) {
  if (req.method !== "POST") throw new AppError("Method not allowed", 405);

  await dbConnect();

  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
  const refreshToken = cookies.refreshToken;

  if (!refreshToken) throw new AppError("Refresh token required", 400);

  const payload = await verifyRefreshToken(refreshToken);
  if (!payload) throw new AppError("Invalid refresh token", 401);

  const user = await User.findById(payload.id);
  if (!user) throw new AppError("User not found", 404);

  const newAccessToken = generateAccessToken(user);

  res.setHeader("Set-Cookie", accessTokenCookie(newAccessToken));

  return res.status(200).json({ status: "refreshed" });
}

export default errorHandler(handler);