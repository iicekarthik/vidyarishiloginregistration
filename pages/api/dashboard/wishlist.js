import dbConnect from "@/vidyarishiapi/config/db";
import Wishlist from "@/vidyarishiapi/models/Wishlist";
import {
  verifyAccessToken,
  verifyRefreshToken,
  generateAccessToken,
} from "@/vidyarishiapi/utils/jwt";
import {parse} from "cookie";
import AppError from "@/vidyarishiapi/lib/AppError";
import cookie from "cookie";

export default async function handler(req, res) {
  await dbConnect();

  try {
    //  AUTH 
    const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
    let accessToken = cookies.accessToken;
    const refreshToken = cookies.refreshToken;

    let decoded;

    if (accessToken) {
      decoded = verifyAccessToken(accessToken);
    } else if (refreshToken) {
      decoded = verifyRefreshToken(refreshToken);
      accessToken = generateAccessToken({ id: decoded.id });

      res.setHeader(
        "Set-Cookie",
        cookie.serialize("accessToken", accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 15,
        })
      );
    } else {
      throw new AppError("Unauthorized", 401);
    }

    const userId = decoded.id;

    //  GET 
    if (req.method === "GET") {
      const wishlist = await Wishlist.find({ userId }).sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        data: wishlist,
      });
    }

    //  POST 
    if (req.method === "POST") {
      const { courseId, title, description, meta } = req.body;

      if (!courseId || !title) {
        throw new AppError("courseId and title are required", 400);
      }

      await Wishlist.findOneAndUpdate(
        { userId, courseId },
        {
          userId,
          courseId,
          title,
          description,
          meta,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      return res.status(201).json({
        success: true,
        message: "Added to wishlist",
      });
    }

    //  DELETE 
    if (req.method === "DELETE") {
      const { courseId } = req.body;

      if (!courseId) {
        throw new AppError("courseId is required", 400);
      }

      await Wishlist.findOneAndDelete({ userId, courseId });

      return res.status(200).json({
        success: true,
        message: "Removed from wishlist",
      });
    }

    res.setHeader("Allow", ["GET", "POST", "DELETE"]);
    return res.status(405).json({
      success: false,
      message: `Method ${req.method} not allowed`,
    });
  } catch (error) {
    console.error("Wishlist API error:", error);

    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}