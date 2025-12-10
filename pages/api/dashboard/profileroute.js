// pages/api/dashboard/profileroute.js

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

const accessTokenCookie = token =>
  `accessToken=${token}; Max-Age=1200; HttpOnly; Path=/; ${
    isProd ? "SameSite=None; Secure" : "SameSite=Lax"
  }`;

async function handler(req, res) {
  if (req.method !== "GET") {
    throw new AppError("Only GET allowed", 405);
  }

  await dbConnect();

  // Parse cookies
  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
  const accessToken = cookies.accessToken;
  const refreshToken = cookies.refreshToken;

  // 1️⃣ Try access token first
  let userPayload = accessToken ? verifyAccessToken(accessToken) : null;

  // 2️⃣ Try refresh token
  if (!userPayload && refreshToken) {
    const refreshPayload = await verifyRefreshToken(refreshToken);

    if (!refreshPayload) throw new AppError("Unauthorized", 401);

    const newAccessToken = generateAccessToken({ _id: refreshPayload.id });

    // FIXED COOKIE SETTINGS
    res.setHeader("Set-Cookie", accessTokenCookie(newAccessToken));

    userPayload = { id: refreshPayload.id };
  }

  // 3️⃣ Unauthorized
  if (!userPayload?.id) {
    throw new AppError("Unauthorized", 401);
  }

  // 4️⃣ Fetch user
  const user = await User.findById(userPayload.id).lean();
  if (!user) throw new AppError("User not found", 404);

  const { password, __v, ...safeUser } = user;

  return res.status(200).json(safeUser);
}

export default errorHandler(handler);
