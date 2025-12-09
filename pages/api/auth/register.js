import dbConnect from "@/vidyarishiapi/config/db";
import User from "@/vidyarishiapi/models/User";
import { isValidEmail, isValidPhone } from "@/vidyarishiapi/utils/validators";

import {
  generateAccessToken,
  generateRefreshToken,
} from "@/vidyarishiapi/utils/jwt";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Only POST allowed" });

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

  if (!isValidPhone(phone) || !fullName || !isValidEmail(email))
    return res.status(400).json({ message: "Missing required fields" });

  // Check duplicate
  const exists = await User.findOne({ phone });
  if (exists) return res.status(400).json({ message: "User already exists" });

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
