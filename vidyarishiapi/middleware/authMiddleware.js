import { verifyAccessToken, verifyRefreshToken, generateAccessToken } from "../utils/jwt";
import dbConnect from "../config/db";
import cookie from "cookie";

export const authMiddleware = (handler) => {
  return async (req, res) => {
    await dbConnect();

    const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};
    const accessToken = cookies.accessToken;
    const refreshToken = cookies.refreshToken;

    let user = accessToken ? verifyAccessToken(accessToken) : null;

    if (!user && refreshToken) {
      const payload = await verifyRefreshToken(refreshToken);
      if (!payload) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const newAccess = generateAccessToken({ _id: payload.id });

      res.setHeader(
        "Set-Cookie",
        `accessToken=${newAccess}; Max-Age=1200; Path=/; HttpOnly; SameSite=Strict`
      );

      user = { id: payload.id };
    }

    if (!user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    req.user = user;
    return handler(req, res);
  };
};