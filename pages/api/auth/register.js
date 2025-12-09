// pages/api/auth/register.js
import dbConnect from "@/vidyarishiapi/config/db";
import User from "@/vidyarishiapi/models/User";
import { isValidEmail, isValidPhone } from "@/vidyarishiapi/utils/validators";
import {
  generateAccessToken,
  generateRefreshToken,
} from "@/vidyarishiapi/utils/jwt";
import { errorHandler } from "@/vidyarishiapi/lib/errorHandler";
import AppError from "@/vidyarishiapi/lib/AppError";

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

  if (!isValidPhone(phone) || !fullName || !isValidEmail(email)) {
    throw new AppError("Missing or invalid required fields", 400);
  }

  // Check duplicate
  const exists = await User.findOne({ phone });
  if (exists) {
    throw new AppError("User already exists", 400);
  }

  // Create user
  const user = await User.create({
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

  // NEW TOKEN SYSTEM
  const accessToken = generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user);

  return res.status(201).json({
    status: "success",
    accessToken,
    refreshToken,
    user,
  });
}

export default errorHandler(handler);
