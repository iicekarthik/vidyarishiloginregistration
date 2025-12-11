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
  // Browser se accessToken & refreshToken nikaale ja rahe hain . Agar cookie header empty ho → cookies = {}.
  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
  const accessToken = cookies.accessToken;
  const refreshToken = cookies.refreshToken;

  // Validate access token
  let userPayload = accessToken ? verifyAccessToken(accessToken) : null;

  // If expired → try refresh token
  // Agar access token expire ho gaya . But user logout nahi hona chahiye .
  // Isliye hum refresh token check karte hain
  if (!userPayload && refreshToken) {
    // Refresh token se user ki ID milti hai. Agar valid nahi → refreshPayload = null
    const refreshPayload = await verifyRefreshToken(refreshToken);

    if (!refreshPayload) throw new AppError("Unauthorized", 401);

    // New 20-minute access token generate. Backend automatically session refresh kar raha hai.
    const newAccessToken = generateAccessToken({ _id: refreshPayload.id });

    // Set new cookie
    // Refresh ke baad response me new accessToken cookie set ho jaati hai
    // sameSite=strict → Only your site can send this cookie
    res.setHeader(
      "Set-Cookie",
     `accessToken=${newAccessToken}; Max-Age=1200; HttpOnly; SameSite=Strict; Path=/`
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

  const update = {};   //Empty object jisme hum sirf wahi fields daalenge jo user ne bheje hain

  if (firstName !== undefined || lastName !== undefined) {
    const fullName = `${firstName || ""} ${lastName || ""}`.trim();
    if (fullName) update.fullName = fullName;
  }

  // "undefined field database me kabhi update nahi hoti"
  if (phone !== undefined) update.phone = phone;
  if (skill !== undefined) update.skill = skill;
  if (biography !== undefined) update.biography = biography;
  if (facebook !== undefined) update.facebook = facebook;
  if (twitter !== undefined) update.twitter = twitter;
  if (linkedin !== undefined) update.linkedin = linkedin;
  if (website !== undefined) update.website = website;
  if (github !== undefined) update.github = github;

  const user = await User.findByIdAndUpdate(        //user ko ID se update karega
    userPayload.id,
    update,
    { new: true }     //updated user return karega
  ).lean();   //pure JS object (fast)
  if (!user) throw new AppError("User not found", 404);

  return res.status(200).json({ status: "success", user });
}

export default errorHandler(handler);