import dbConnect from "@/vidyarishiapi/config/db";
import EnrolledCourse from "@/vidyarishiapi/models/EnrolledCourse";
import { verifyAccessToken } from "@/vidyarishiapi/utils/jwt";
import { parse } from "cookie";
import { AppError, errorHandler } from "@/vidyarishiapi/lib/errorHandler";

async function handler(req, res) {
  await dbConnect();
  const { method } = req;
  const { id } = req.query;

  const cookies = parse(req.headers.cookie || "");
  const token = cookies.accessToken;
  if (!token) throw new AppError("Unauthorized", 401);

  const decoded = verifyAccessToken(token);
  const userId = decoded?.id;

  if (method === "GET") {
    const course = await EnrolledCourse.findOne({ _id: id, userId });
    if (!course) throw new AppError("Course not found", 404);
    return res.status(200).json(course);
  }

  if (method === "PUT") {
    const { progress, status } = req.body;

    const updated = await EnrolledCourse.findOneAndUpdate(
      { _id: id, userId },
      {
        ...(progress !== undefined ? { progress } : {}),
        ...(status ? { status } : {}),
      },
      { new: true }
    );

    if (!updated) throw new AppError("Course not found", 404);
    return res.status(200).json(updated);
  }

  if (method === "DELETE") {
    const removed = await EnrolledCourse.deleteOne({ _id: id, userId });
    if (!removed.deletedCount) throw new AppError("Course not found", 404);
    return res.status(200).json({ message: "Course removed" });
  }

  throw new AppError("Method Not Allowed", 405);
}

export default errorHandler(handler);
