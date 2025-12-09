// pages/api/auth/logout.js
import dbConnect from "@/vidyarishiapi/config/db";
import RefreshToken from "@/vidyarishiapi/models/RefreshToken";

export default async function handler(req, res) {
  await dbConnect();
  
  const { refreshToken } = req.body;

  await RefreshToken.deleteOne({ token: refreshToken });

  return res.status(200).json({ message: "Logged out" });
}
