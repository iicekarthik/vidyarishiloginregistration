import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true},

    dob: { type: Date },
    gender: { type: String },
    qualification: { type: String, required: true },
    state: { type: String },
    city: { type: String },
    course: { type: String, required: true },

    whatsapp: { type: Boolean, default: false },

    skill: { type: String},
    biography: { type: String, trim: true, maxlength: 500 },

    facebook: { type: String },
    twitter: { type: String },
    linkedin: { type: String },
    website: { type: String },
    github: { type: String },

    isPhoneNumberVerified: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);
