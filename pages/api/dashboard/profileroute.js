import dbConnect from "@/vidyarishiapi/config/db";
import User from "@/vidyarishiapi/models/User";
import { verifyAccessToken } from "@/vidyarishiapi/utils/jwt";

export async function GET(req) {
  await dbConnect();

  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token)
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

    const decoded = verifyAccessToken(token);
    if (!decoded?.id)
      return new Response(JSON.stringify({ error: "Invalid or expired token" }), { status: 401 });

    const user = await User.findById(decoded.id).lean();
    if (!user)
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });


    return new Response(JSON.stringify(safeUser), { status: 200 });
  } catch (err) {
    console.error("Profile API error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}