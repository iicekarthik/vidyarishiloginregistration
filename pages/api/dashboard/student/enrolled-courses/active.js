import dbConnect from "@/vidyarishiapi/config/db";
import EnrolledCourse from "@/vidyarishiapi/models/EnrolledCourse";
import { verifyAccessToken } from "@/vidyarishiapi/utils/jwt";
import { parse } from "cookie";
import { AppError, errorHandler } from "@/vidyarishiapi/lib/errorHandler";

async function handler(req, res) {
  await dbConnect();

  if (req.method !== "GET") {
    throw new AppError("Method Not Allowed", 405);
  }

  const cookies = parse(req.headers.cookie || "");
  const token = cookies.accessToken;

  if (!token) {
    throw new AppError("Unauthorized", 401);
  }

  const decoded = verifyAccessToken(token);
  const userId = decoded?.id;

  const courses = await EnrolledCourse.find({
    userId,
    status: "active",
  }).sort({ createdAt: -1 });

  return res.status(200).json(courses);
}

export default errorHandler(handler);
