import dbConnect from "@/vidyarishiapi/config/db";
import User from "@/vidyarishiapi/models/User";
import { verifyJwt } from "@/vidyarishiapi/utils/jwt";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Only POST allowed" });

  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  const decoded = verifyJwt(token);
  if (!decoded?.id) return res.status(401).json({ message: "Unauthorized" });

  await dbConnect();

  const { firstName, lastName, phone, bio } = req.body;
  const fullName = `${firstName} ${lastName}`;

  const user = await User.findByIdAndUpdate(decoded.id, { fullName, phone, bio }, { new: true });
  if (!user) return res.status(404).json({ message: "User not found" });

  return res.status(200).json({ status: "success", user });
}
