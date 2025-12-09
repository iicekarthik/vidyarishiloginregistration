import dbConnect from "@/vidyarishiapi/config/db";
import User from "@/vidyarishiapi/models/User";
import { isValidPhone } from "@/vidyarishiapi/utils/validators"
import { createOtp } from "@/vidyarishiapi/services/otp.service";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Only POST allowed" });

  const { phone } = req.body;

  if (!isValidPhone(phone))
    return res.status(400).json({ message: "Invalid phone number" });

  await dbConnect();

  const user = await User.findOne({ phone });

  await createOtp(phone);

  return res.status(200).json({
    exists: !!user,
    otpSent: true,
  });
}
