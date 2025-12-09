import { verifyAccessToken, verifyRefreshToken, generateAccessToken } from "../utils/jwt";
import dbConnect from "../config/db";
import cookie from "cookie";

export const authMiddleware = (handler) => {
  return async (req, res) => {
    try {
      await dbConnect();

      // Parse cookies
      const cookies = req.headers.cookie
        ? cookie.parse(req.headers.cookie)
        : {};

      const authHeader = req.headers.authorization;
      const accessToken = authHeader?.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;

      if (!accessToken) {
        return res.status(401).json({ message: "No access token provided" });
      }

      // Try verifying access token
      let user = verifyAccessToken(accessToken);

      // If access token expired → use refresh
      if (!user) {
        const refreshToken = cookies.refreshToken;

        if (!refreshToken) {
          return res.status(401).json({ message: "Token expired. Login again." });
        }

        const refreshPayload = await verifyRefreshToken(refreshToken);

        if (!refreshPayload) {
          return res.status(401).json({ message: "Invalid refresh token" });
        }

        // Generate new access token
        const newAccessToken = generateAccessToken({ _id: refreshPayload.id });

        res.setHeader("x-access-token", newAccessToken);
        user = { id: refreshPayload.id };
      }

      req.user = user;
      return handler(req, res);

    } catch (err) {
      console.error("AUTH MIDDLEWARE ERROR", err);
      return res.status(500).json({ message: "Authentication error" });
    }
  };
};