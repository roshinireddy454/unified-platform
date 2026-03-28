import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: {
      type:    String,
      enum:    ["instructor", "student"],
      default: "student",
    },
    enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    photoUrl: { type: String, default: "" },

    // ── Email Verification ────────────────────────────────────
    isEmailVerified:       { type: Boolean, default: false },
    emailVerifyToken:      { type: String,  default: null },
    emailVerifyExpires:    { type: Date,    default: null },

    // ── Password Reset ────────────────────────────────────────
    passwordResetToken:    { type: String,  default: null },
    passwordResetExpires:  { type: Date,    default: null },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);