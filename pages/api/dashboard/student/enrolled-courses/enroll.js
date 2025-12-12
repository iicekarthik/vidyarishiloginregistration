import dbConnect from "@/vidyarishiapi/config/db";
import EnrolledCourse from "@/vidyarishiapi/models/EnrolledCourse";
import { verifyAccessToken } from "@/vidyarishiapi/utils/jwt";
import { parse } from "cookie";
import { AppError, errorHandler } from "@/vidyarishiapi/lib/errorHandler";

async function handler(req, res) {           //API handler function start
  await dbConnect();

  if (req.method !== "POST") {
    throw new AppError("Method Not Allowed", 405);
  }

  const cookies = parse(req.headers.cookie || "");
  const token = cookies.accessToken;       //accessToken cookie me expected hai — yahi se user authenticate hota
  if (!token) throw new AppError("Unauthorized. Login Required", 401);  //Agar token missing → unauthorized

  const decoded = verifyAccessToken(token);
  const userId = decoded?.id;  //Token decode karke user ID nikal liya

  const { courseId, title, description } = req.body;

  if (!courseId || !title) {
    throw new AppError("courseId & title are required", 400);
  }

  // Agar user already enrolled hai to duplicate create na karo — existing object return karo
  const exists = await EnrolledCourse.findOne({ userId, courseId });
  if (exists) return res.status(200).json(exists);

  const course = await EnrolledCourse.create({
    userId,
    courseId,
    title,
    description,
    progress: 0,
    status: "enrolled",
  });    //Naya enrolled course create karo — default progress 0, status "enrolled

  return res.status(201).json(course);
}

//Handler ko global errorHandler me wrap karke export. 
// Agar function me koi error throw hua, woh standardized response dega
export default errorHandler(handler);  
