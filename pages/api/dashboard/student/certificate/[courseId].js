import PDFDocument from "pdfkit";
import dbConnect from "@/vidyarishiapi/config/db";
import EnrolledCourse from "@/vidyarishiapi/models/EnrolledCourse";
import { verifyAccessToken } from "@/vidyarishiapi/utils/jwt";
import { parse } from "cookie";
import { AppError, errorHandler } from "@/vidyarishiapi/lib/errorHandler";

async function handler(req, res) {
  await dbConnect();

  const { courseId } = req.query;

  const cookies = parse(req.headers.cookie || "");
  const token = cookies.accessToken;
  if (!token) throw new AppError("Unauthorized", 401);

  const decoded = verifyAccessToken(token);
  const userId = decoded?.id;

  const course = await EnrolledCourse.findOne({ userId, courseId });
  if (!course) throw new AppError("Not enrolled in this course", 404);
  if (course.progress < 100)       //Progress must be 100 (ya desired threshold) to allow certificate. Else 403
    throw new AppError("Complete the course to download certificate", 403);

  const doc = new PDFDocument();     //PDF document create.
  res.setHeader("Content-Type", "application/pdf");   //header tells browser it's a PDF.
  res.setHeader(
    "Content-Disposition",          
    `attachment; filename="certificate-${courseId}.pdf"`  //makes browser download it as a file (with given filename).
  );

  doc.pipe(res); //pdfkit stream ko response ke saath pipe kar diya — iska matlab jo PDF generate hota hai woh directly client ko stream hot

  doc.fontSize(30).text("Certificate of Completion", { align: "center" });
  doc.moveDown();   //nserts vertical spacing.
  doc.fontSize(18).text(`This certifies the completion of`, { align: "center" });
  doc.moveDown();
  doc.fontSize(24).text(course.title, { align: "center" });

  doc.end();  //PDF generation finish kar do — stream close.
}

export default errorHandler(handler);