import otpStore from "@/vidyarishiapi/store/otp.store"
import { sendSMS } from "./sms.service";
import otpGenerator from "otp-generator";

export const createOtp = async (phone) => {
  const otp = String(Math.floor(1000 + Math.random() * 9000));

//   const otp = otpGenerator.generate(4, {
//   digits: true,
//   alphabets: false,
//   upperCase: false,
//   specialChars: false,
// });

  const expiresAt = Date.now() + 30 * 1000; 

// OTP memory store me save ho gaya
  otpStore.set(phone, { otp, expiresAt });

  await sendSMS(phone, `Your VidyaRishi OTP is ${otp}`);

  return otp;
};

export const checkOtp = async (phone, otp) => {
  const record = otpStore.get(phone);
  if (!record) return { success: false, msg: "OTP not found" };

  if (Date.now() > record.expiresAt) {
    otpStore.delete(phone);
    return { success: false, msg: "OTP expired" };
  }

  // OTP memory store me save ho gaya
  if (record.otp !== otp) return { success: false, msg: "OTP invalid" };

  otpStore.delete(phone); 
  return { success: true };
};
