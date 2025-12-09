// pages/api/auth/refresh-token.js
import { verifyRefreshToken, generateAccessToken } from "@/vidyarishiapi/utils/jwt";
import User from "@/vidyarishiapi/models/User";
import dbConnect from "@/vidyarishiapi/config/db";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  await dbConnect();

  const { refreshToken } = req.body;

  const payload = await verifyRefreshToken(refreshToken);
  if (!payload) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }

  const user = await User.findById(payload.id);
  const newAccessToken = generateAccessToken(user);

  return res.status(200).json({
    accessToken: newAccessToken,
  });
}
