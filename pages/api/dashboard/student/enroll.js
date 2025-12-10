import dbConnect from "@/vidyarishiapi/config/db";
import EnrolledCourse from "@/vidyarishiapi/models/EnrolledCourse";
import { verifyAccessToken } from "@/vidyarishiapi/utils/jwt";
import { parse } from "cookie";
import { AppError, errorHandler } from "@/vidyarishiapi/lib/errorHandler";

async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") {
    throw new AppError("Method Not Allowed", 405);
  }

  const cookies = parse(req.headers.cookie || "");
  const token = cookies.accessToken;
  if (!token) throw new AppError("Unauthorized. Login Required", 401);

  const decoded = verifyAccessToken(token);
  const userId = decoded?.id;

  const { courseId, title, description } = req.body;

  if (!courseId || !title) {
    throw new AppError("courseId & title are required", 400);
  }

  const exists = await EnrolledCourse.findOne({ userId, courseId });
  if (exists) return res.status(200).json(exists);

  const course = await EnrolledCourse.create({
    userId,
    courseId,
    title,
    description,
    progress: 0,
    status: "enrolled",
  });

  return res.status(201).json(course);
}

export default errorHandler(handler);
