import dbConnect from "@/vidyarishiapi/config/db";
import EnrolledCourse from "@/vidyarishiapi/models/EnrolledCourse";
import { verifyAccessToken } from "@/vidyarishiapi/utils/jwt";
import { parse } from "cookie";  //parse function HTTP request headers me se cookie string ko object me convert karta hai
import { AppError, errorHandler } from "@/vidyarishiapi/lib/errorHandler";

async function handler(req, res) {  //API handler function start.ye function request/response handle karega.
  await dbConnect();
  const { method } = req;
  const { id } = req.query;  //URL parameter (file name is [id].js matlab request URL me ? ya path param se id milti hai).
  //  Yeh _id of enrolled course record ke liye use hoga

  const cookies = parse(req.headers.cookie || ""); //Request headers me agar cookie present hai to parse karein, warna empty string
  const token = cookies.accessToken;   //token hamara accessToken cookie se nikalta hai. Agar cookie missing hai to token undefined hoga
  if (!token) throw new AppError("Unauthorized", 401);

  const decoded = verifyAccessToken(token);
  const userId = decoded?.id;

  if (method === "GET") {     //fetch single record
    // findOne query jisme do filters hain. _id: id — requested record ka unique MongoDB id.
    // userId — ensure kar rahe ki logged-in user hi apna record access kare (authorization check).
    const course = await EnrolledCourse.findOne({ _id: id, userId });
    if (!course) throw new AppError("Course not found", 404);
    return res.status(200).json(course);
  }

  if (method === "PUT") {     //update progress / status
    // frontend req.body me progress (number) aur/ya status (string) bhej sakta ha
    const { progress, status } = req.body;

    const updated = await EnrolledCourse.findOneAndUpdate(
      { _id: id, userId },
      {
        ...(progress !== undefined ? { progress } : {}), //ensures progress=0 bhi update ho sake (agar frontend zero bheje toh falsy check se skip nahi ho)
        ...(status ? { status } : {}),              //uses truthy check — agar status empty string ya null ho toh skip
      },
      { new: true }
    );

    if (!updated) throw new AppError("Course not found", 404);    
    return res.status(200).json(updated);
  }

  if (method === "DELETE") {
    const removed = await EnrolledCourse.deleteOne({ _id: id, userId }); //deleteOne with filter ensures only owner can delete their enrolled record.
    if (!removed.deletedCount) throw new AppError("Course not found", 404);
    return res.status(200).json({ message: "Course removed" });
  }

  throw new AppError("Method Not Allowed", 405);
}

export default errorHandler(handler);
