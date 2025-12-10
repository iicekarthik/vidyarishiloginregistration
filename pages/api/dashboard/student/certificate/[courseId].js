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
  if (course.progress < 100)
    throw new AppError("Complete the course to download certificate", 403);

  const doc = new PDFDocument();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="certificate-${courseId}.pdf"`
  );

  doc.pipe(res);

  doc.fontSize(30).text("Certificate of Completion", { align: "center" });
  doc.moveDown();
  doc.fontSize(18).text(`This certifies the completion of`, { align: "center" });
  doc.moveDown();
  doc.fontSize(24).text(course.title, { align: "center" });

  doc.end();
}

export default errorHandler(handler);