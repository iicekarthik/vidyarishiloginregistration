import dbConnect from "@/vidyarishiapi/config/db";
import User from "@/vidyarishiapi/models/User";
import { verifyAccessToken } from "@/vidyarishiapi/utils/jwt";
import { errorHandler } from "@/vidyarishiapi/lib/errorHandler";
import AppError from "@/vidyarishiapi/lib/AppError";

async function handler(req, res) {
  if (req.method !== "POST") {
    throw new AppError("Only POST allowed", 405);
  }

  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];
  if (!token) throw new AppError("Unauthorized", 401);

  const decoded = verifyAccessToken(token);
  if (!decoded?.id) throw new AppError("Invalid or expired token", 401);

  await dbConnect();

  const {
    firstName,
    lastName,
    phone,
    gender,
    dob,
    qualification,
    state,
    city,
    course,
    skill,
    biography,
    facebook,
    twitter,
    linkedin,
    website,
    github,
  } = req.body;

  const fullName = `${firstName || ""} ${lastName || ""}`.trim();

  const update = {
    ...(fullName && { fullName }),
    ...(phone && { phone }),
    ...(gender && { gender }),
    ...(dob && { dob }),
    ...(qualification && { qualification }),
    ...(state && { state }),
    ...(city && { city }),
    ...(course && { course }),

    skill: skill ?? "",
    biography: biography ?? "",

    facebook: facebook ?? "",
    twitter: twitter ?? "",
    linkedin: linkedin ?? "",
    website: website ?? "",
    github: github ?? "",
  };

  const user = await User.findByIdAndUpdate(decoded.id, update, { new: true });

  if (!user) throw new AppError("User not found", 404);

  return res.status(200).json({ status: "success", user });
}

export default errorHandler(handler);
