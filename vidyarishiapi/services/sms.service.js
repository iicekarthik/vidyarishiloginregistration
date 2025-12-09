import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const sendSMS = async (phone, message) => {
  console.log("\n==============================");
  console.log("OTP SMS (DEV MODE)");
  console.log("To:", phone);
  console.log("Message:", message);
  console.log("==============================\n");

  // DO NOT send SMS in dev mode
  return true;
};


// export const sendSMS = async (phone, message) => {
//   try {
//     await client.messages.create({
//       body: message,
//       from: process.env.TWILIO_FROM_PHONE, 
//       to: `+91${phone}`,
//     });
//   } catch (err) {
//     console.error("Twilio SMS Error:", err);
//     throw new Error("SMS sending failed");
//   }
// };
