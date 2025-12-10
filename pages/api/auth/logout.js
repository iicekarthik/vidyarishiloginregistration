import { errorHandler } from "@/vidyarishiapi/lib/errorHandler";
import AppError from "@/vidyarishiapi/lib/AppError";

async function handler(req, res) {
  if (req.method !== "POST") throw new AppError("Only POST allowed", 405);

  const commonFlags =
    "Path=/; HttpOnly; SameSite=Strict" +
    (process.env.NODE_ENV === "production" ? "; Secure" : "");

  res.setHeader("Set-Cookie", [
    `accessToken=; Max-Age=0; ${commonFlags}`,
    `refreshToken=; Max-Age=0; ${commonFlags}`,
  ]);

  return res.status(200).json({ message: "Logged out" });
}

export default errorHandler(handler);