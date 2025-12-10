import mongoose from "mongoose";

const EnrolledCourseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // now required
    },

    courseId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },

    progress: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["enrolled", "active", "completed"],
      default: "enrolled",
    },

    meta: { type: Object, default: {} },
  },
  { timestamps: true }
);

export default mongoose.models.EnrolledCourse ||
  mongoose.model("EnrolledCourse", EnrolledCourseSchema);