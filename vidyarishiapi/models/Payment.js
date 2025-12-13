import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    orderId: { type: String, unique: true },
    cfOrderId: String,

    customerName: String,
    customerEmail: String,
    customerPhone: String,

    orderAmount: Number,
    currency: { type: String, default: "INR" },

    orderStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED"],
      default: "PENDING",
    },

    orderNote: String,
    paymentSessionId: String,
    paymentCreatedAt: String,
  },
  { timestamps: true }
);

export default mongoose.models.Payment ||
  mongoose.model("Payment", paymentSchema);