// pages/api/auth/verify-otp.js
import dbConnect from "@/vidyarishiapi/config/db";
import User from "@/vidyarishiapi/models/User";
import { isValidPhone } from "@/vidyarishiapi/utils/validators";
import { checkOtp } from "@/vidyarishiapi/services/otp.service";
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

  const { phone, otp } = req.body;

  if (!isValidPhone(phone) || !otp) {
    throw new AppError("Phone & OTP required", 400);
  }

  await dbConnect();

  // Validate OTP
  const result = await checkOtp(phone, otp);

  if (!result.success) {
    throw new AppError(result.msg || "OTP validation failed", 400);
  }

  // Check if user exists
  const user = await User.findOne({ phone });

  // If user exists → Login
  if (user) {
    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);

    return res.status(200).json({
      status: "login_success",
      isUserExist: true,
      accessToken,
      refreshToken,
    });
  }

  // If user is new → Continue registration
  return res.status(200).json({
    status: "continue_registration",
    isUserExist: false,
  });
}

export default errorHandler(handler);
