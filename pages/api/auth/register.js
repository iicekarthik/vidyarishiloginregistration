// pages/api/auth/register.js

import dbConnect from "@/vidyarishiapi/config/db";
import User from "@/vidyarishiapi/models/User";
import {
  generateAccessToken,
  generateRefreshToken,
} from "@/vidyarishiapi/utils/jwt";
import { errorHandler } from "@/vidyarishiapi/lib/errorHandler";
import AppError from "@/vidyarishiapi/lib/AppError";

const isProd = process.env.NODE_ENV === "production";

const setCookie = (name, token, maxAge) =>
  `${name}=${token}; Max-Age=${maxAge}; HttpOnly; Path=/; ${
    isProd ? "SameSite=None; Secure" : "SameSite=Lax"
  }`;

async function handler(req, res) {
  if (req.method !== "POST") {
    throw new AppError("Only POST allowed", 405);
  }

  await dbConnect();

  const {
    phone,
    fullName,
    email,
    dob,
    gender,
    qualification,
    state,
    city,
    course,
    whatsapp,
  } = req.body;

  if (!phone || !fullName || !email) {
    throw new AppError("Missing required fields", 400);
  }

  const existingUser = await User.findOne({ phone });
  if (existingUser) {
    throw new AppError("User already exists", 400);
  }

  // Create User
  const newUser = await User.create({
    phone,
    fullName,
    email,
    dob,
    gender,
    qualification,
    state,
    city,
    course,
    whatsapp,
    isPhoneNumberVerified: true,
  });

  // Generate tokens
const accessToken = generateAccessToken(newUser);

// FIXED: pass full newUser object
const refreshToken = await generateRefreshToken(newUser);

  // Set HttpOnly cookies
  res.setHeader("Set-Cookie", [
    setCookie("accessToken", accessToken, 1200),
    setCookie("refreshToken", refreshToken, 60 * 60 * 24 * 7),
  ]);

  return res.status(201).json({
    status: "success",
    message: "Registration successful",
    userId: newUser,
  });
}

export default errorHandler(handler);