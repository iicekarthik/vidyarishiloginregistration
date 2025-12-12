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

const isProd = process.env.NODE_ENV === "production";

const accessTokenCookie = token =>
  `accessToken=${token}; Max-Age=1200; HttpOnly; Path=/; ${isProd ? "SameSite=None; Secure" : "SameSite=Lax"
  }`;

const refreshTokenCookie = token =>
  `refreshToken=${token}; Max-Age=604800; HttpOnly; Path=/; ${isProd ? "SameSite=None; Secure" : "SameSite=Lax"
  }`;

async function handler(req, res) {
  if (req.method !== "POST") throw new AppError("Only POST allowed", 405);

  const { phone, otp } = req.body;
  if (!isValidPhone(phone) || !otp) {
    throw new AppError("Phone & OTP required", 400);
  }

  await dbConnect();
  
  // 🔥 NEW: Check OTP using new validation system (attempts, expiry, lock)
  const result = await checkOtp(phone, otp);

  if (!result.success) {
    // Return specific failure message (invalid, expired, locked, or attempts left)
    throw new AppError(result.msg || "OTP validation failed", 400);
  }
  const user = await User.findOne({ phone });

  // LOGIN FLOW
  if (user) {

    if (!user.isPhoneNumberVerified) {
      user.isPhoneNumberVerified = true;
      await user.save();
    }

    // ⭐ Reload updated user
    const updatedUser = await User.findById(user._id);

    const accessToken = generateAccessToken(updatedUser);
    const refreshToken = await generateRefreshToken(updatedUser);

    res.setHeader("Set-Cookie", [
      accessTokenCookie(accessToken),
      refreshTokenCookie(refreshToken),
    ]);

    return res.status(200).json({
      status: "login_success",
      isUserExist: true,
      user: updatedUser,
    });
  }

  return res.status(200).json({
    status: "continue_registration",
    isUserExist: false,
  });
}

export default errorHandler(handler);
