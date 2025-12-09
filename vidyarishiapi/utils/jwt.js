import jwt from "jsonwebtoken";
import RefreshToken from "../../vidyarishiapi/models/RefreshToken";
import dbConnect from "../config/db";

export const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, phone: user.phone },
    process.env.JWT_SECRET,
    { expiresIn: "20m" } // short lived
  );
};

export const generateRefreshToken = async (user) => {
  await dbConnect();

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  await RefreshToken.create({
    userId: user._id,
    token,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return token;
};

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    console.error("Access token verification failed:", err.message);
    return null;
  }
};

export const verifyRefreshToken = async (token) => {
  try {
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const exists = await RefreshToken.findOne({ token });
    if (!exists) {
      console.warn("Refresh token not found in DB");
      return null;
    }
    return payload;
  } catch (err) {
    console.error("Refresh token verification failed:", err.message);
    return null;
  }
};

