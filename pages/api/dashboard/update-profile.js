// pages/api/dashboard/update-profile.js

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

async function handler(req, res) {
  if (req.method !== "POST") {
    throw new AppError("Only POST allowed", 405);
  }

  // Parse cookies
 const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
  const accessToken = cookies.accessToken;
  const refreshToken = cookies.refreshToken;

  // 1️⃣ Validate access token
  let userPayload = accessToken ? verifyAccessToken(accessToken) : null;

  // 2️⃣ If expired → try refresh token
  if (!userPayload && refreshToken) {
    const refreshPayload = await verifyRefreshToken(refreshToken);

    if (!refreshPayload) throw new AppError("Unauthorized", 401);

    const newAccessToken = generateAccessToken({ _id: refreshPayload.id });

    // Set new cookie
    res.setHeader(
      "Set-Cookie",
      `accessToken=${newAccessToken}; Max-Age=1200; httpOnly; sameSite=strict`
    );

    userPayload = { id: refreshPayload.id };
  }

  if (!userPayload?.id) {
    throw new AppError("Unauthorized", 401);
  }

  await dbConnect();

  const {
    firstName,
    lastName,
    phone,
    skill,
    biography,
    facebook,
    twitter,
    linkedin,
    website,
    github,
  } = req.body;

  const update = {};

  if (firstName !== undefined || lastName !== undefined) {
    const fullName = `${firstName || ""} ${lastName || ""}`.trim();
    if (fullName) update.fullName = fullName;
  }

  if (phone !== undefined) update.phone = phone;
  if (skill !== undefined) update.skill = skill;
  if (biography !== undefined) update.biography = biography;
  if (facebook !== undefined) update.facebook = facebook;
  if (twitter !== undefined) update.twitter = twitter;
  if (linkedin !== undefined) update.linkedin = linkedin;
  if (website !== undefined) update.website = website;
  if (github !== undefined) update.github = github;

  const user = await User.findByIdAndUpdate(userPayload.id, update, { new: true }).lean();
  if (!user) throw new AppError("User not found", 404);

  return res.status(200).json({ status: "success", user });
}

export default errorHandler(handler);