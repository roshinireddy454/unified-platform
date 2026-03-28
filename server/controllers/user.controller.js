import { User }        from "../models/user.model.js";
import { InviteToken } from "../models/inviteToken.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import { Course }      from "../models/course.model.js";
import bcrypt          from "bcryptjs";
import crypto          from "crypto";
import { generateToken } from "../utils/generateToken.js";
import { deleteMediaFromCloudinary, uploadMedia } from "../utils/cloudinary.js";
import {
  sendVerificationEmail,
  sendTeacherInviteEmail,
  sendPasswordResetEmail,
} from "../utils/email.js";

// ── Password strength validator ───────────────────────────────
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

function validatePassword(password) {
  if (!password || password.length < 8)
    return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(password))
    return "Password must contain at least one uppercase letter.";
  if (!/[a-z]/.test(password))
    return "Password must contain at least one lowercase letter.";
  if (!/\d/.test(password))
    return "Password must contain at least one number.";
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password))
    return "Password must contain at least one special character.";
  return null; // valid
}

// ── REGISTER (students only) ──────────────────────────────────
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: "All fields are required." });

    // Validate password strength
    const pwdError = validatePassword(password);
    if (pwdError)
      return res.status(400).json({ success: false, message: pwdError });

    // Check duplicate
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing)
      return res.status(400).json({ success: false, message: "An account with this email already exists." });

    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate email verification token
    const verifyToken   = crypto.randomBytes(32).toString("hex");
    const verifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    const user = await User.create({
      name:               name.trim(),
      email:              email.toLowerCase().trim(),
      password:           hashedPassword,
      role:               "student", // ALWAYS student on public signup
      isEmailVerified:    false,
      emailVerifyToken:   verifyToken,
      emailVerifyExpires: verifyExpires,
    });

    // Send verification email (non-blocking — don't fail signup if email fails)
    try {
      await sendVerificationEmail(user.email, user.name, verifyToken);
    } catch (emailErr) {
      console.error("Verification email failed:", emailErr.message);
    }

    return res.status(201).json({
      success: true,
      message: "Account created! Please check your email to verify your account.",
    });
  } catch (error) {
    console.error("register:", error);
    return res.status(500).json({ success: false, message: "Registration failed. Please try again." });
  }
};

// ── REGISTER INSTRUCTOR (invite-token required) ───────────────
export const registerInstructor = async (req, res) => {
  try {
    const { name, email, password, inviteToken } = req.body;

    if (!name || !email || !password || !inviteToken)
      return res.status(400).json({ success: false, message: "All fields including invite token are required." });

    // Validate invite token
    const invite = await InviteToken.findOne({ token: inviteToken });
    if (!invite)
      return res.status(400).json({ success: false, message: "Invalid invite token. Please contact your administrator." });
    if (invite.used)
      return res.status(400).json({ success: false, message: "This invite token has already been used." });
    if (new Date() > invite.expiresAt)
      return res.status(400).json({ success: false, message: "This invite token has expired. Please request a new one." });

    // Validate password strength
    const pwdError = validatePassword(password);
    if (pwdError)
      return res.status(400).json({ success: false, message: pwdError });

    // Check duplicate
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing)
      return res.status(400).json({ success: false, message: "An account with this email already exists." });

    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate email verification token
    const verifyToken   = crypto.randomBytes(32).toString("hex");
    const verifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await User.create({
      name:               name.trim(),
      email:              email.toLowerCase().trim(),
      password:           hashedPassword,
      role:               "instructor",
      isEmailVerified:    false,
      emailVerifyToken:   verifyToken,
      emailVerifyExpires: verifyExpires,
    });

    // Mark invite as used
    invite.used   = true;
    invite.usedBy = user._id;
    invite.usedAt = new Date();
    await invite.save();

    // Send verification email
    try {
      await sendVerificationEmail(user.email, user.name, verifyToken);
    } catch (emailErr) {
      console.error("Verification email failed:", emailErr.message);
    }

    return res.status(201).json({
      success: true,
      message: "Instructor account created! Please verify your email to continue.",
    });
  } catch (error) {
    console.error("registerInstructor:", error);
    return res.status(500).json({ success: false, message: "Registration failed. Please try again." });
  }
};

// ── VERIFY EMAIL ──────────────────────────────────────────────
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token)
      return res.status(400).json({ success: false, message: "Verification token is missing." });

    const user = await User.findOne({
      emailVerifyToken:   token,
      emailVerifyExpires: { $gt: new Date() },
    });

    if (!user)
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification link. Please sign up again or request a new link.",
      });

    user.isEmailVerified    = true;
    user.emailVerifyToken   = null;
    user.emailVerifyExpires = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully! You can now log in.",
    });
  } catch (error) {
    console.error("verifyEmail:", error);
    return res.status(500).json({ success: false, message: "Email verification failed." });
  }
};

// ── RESEND VERIFICATION EMAIL ─────────────────────────────────
export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ success: false, message: "Email is required." });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user)
      return res.status(404).json({ success: false, message: "No account found with this email." });
    if (user.isEmailVerified)
      return res.status(400).json({ success: false, message: "This email is already verified." });

    const verifyToken   = crypto.randomBytes(32).toString("hex");
    const verifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.emailVerifyToken   = verifyToken;
    user.emailVerifyExpires = verifyExpires;
    await user.save();

    await sendVerificationEmail(user.email, user.name, verifyToken);

    return res.status(200).json({ success: true, message: "Verification email sent! Check your inbox." });
  } catch (error) {
    console.error("resendVerification:", error);
    return res.status(500).json({ success: false, message: "Failed to resend verification email." });
  }
};

// ── LOGIN ─────────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password are required." });

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Generic message — don't reveal whether email exists
    if (!user)
      return res.status(401).json({ success: false, message: "Incorrect email or password." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: "Incorrect email or password." });

    // Block unverified users
    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message:        "Please verify your email before logging in.",
        emailNotVerified: true,
        email:          user.email,
      });
    }

    generateToken(res, user, `Welcome back, ${user.name}!`);
  } catch (error) {
    console.error("login:", error);
    return res.status(500).json({ success: false, message: "Login failed. Please try again." });
  }
};

// ── LOGOUT ────────────────────────────────────────────────────
export const logout = async (_, res) => {
  try {
    return res.status(200)
      .cookie("token", "", { maxAge: 0 })
      .json({ success: true, message: "Logged out successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to logout." });
  }
};

// ── FORGOT PASSWORD ───────────────────────────────────────────
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ success: false, message: "Email is required." });

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Always return success — don't reveal if email exists (security)
    if (!user)
      return res.status(200).json({ success: true, message: "If that email exists, a reset link has been sent." });

    const resetToken   = crypto.randomBytes(32).toString("hex");
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.passwordResetToken   = resetToken;
    user.passwordResetExpires = resetExpires;
    await user.save();

    await sendPasswordResetEmail(user.email, user.name, resetToken);

    return res.status(200).json({ success: true, message: "Password reset link sent to your email." });
  } catch (error) {
    console.error("forgotPassword:", error);
    return res.status(500).json({ success: false, message: "Failed to send reset email." });
  }
};

// ── RESET PASSWORD ────────────────────────────────────────────
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password)
      return res.status(400).json({ success: false, message: "Token and new password are required." });

    const pwdError = validatePassword(password);
    if (pwdError)
      return res.status(400).json({ success: false, message: pwdError });

    const user = await User.findOne({
      passwordResetToken:   token,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user)
      return res.status(400).json({ success: false, message: "Invalid or expired reset link." });

    user.password             = await bcrypt.hash(password, 12);
    user.passwordResetToken   = null;
    user.passwordResetExpires = null;
    await user.save();

    return res.status(200).json({ success: true, message: "Password reset successfully. You can now log in." });
  } catch (error) {
    console.error("resetPassword:", error);
    return res.status(500).json({ success: false, message: "Failed to reset password." });
  }
};

// ── VALIDATE INVITE TOKEN (frontend check before showing form) ─
export const validateInviteToken = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token)
      return res.status(400).json({ success: false, message: "Token is required." });

    const invite = await InviteToken.findOne({ token });
    if (!invite)
      return res.status(400).json({ success: false, valid: false, message: "Invalid invite token." });
    if (invite.used)
      return res.status(400).json({ success: false, valid: false, message: "This invite has already been used." });
    if (new Date() > invite.expiresAt)
      return res.status(400).json({ success: false, valid: false, message: "This invite has expired." });

    return res.status(200).json({ success: true, valid: true, label: invite.label || "" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to validate token." });
  }
};

// ── ADMIN: Generate invite token ──────────────────────────────
export const generateInviteToken = async (req, res) => {
  try {
    // Guard: only allow via ADMIN_SECRET header
    const adminSecret = req.headers["x-admin-secret"];
    if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ success: false, message: "Unauthorized." });
    }

    const { label, email, expiryDays = 7 } = req.body;

    const token     = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);

    const invite = await InviteToken.create({
      token,
      label:     label || email || "",
      expiresAt,
      createdBy: "admin",
    });

    // Optionally send invite email if email provided
    if (email) {
      try {
        await sendTeacherInviteEmail(email, token, label || email);
      } catch (emailErr) {
        console.error("Invite email failed:", emailErr.message);
      }
    }

    const inviteUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/teacher-signup?token=${token}`;

    return res.status(201).json({
      success:   true,
      message:   "Invite token generated.",
      token,
      inviteUrl,
      expiresAt,
    });
  } catch (error) {
    console.error("generateInviteToken:", error);
    return res.status(500).json({ success: false, message: "Failed to generate invite token." });
  }
};

// ── ADMIN: List invite tokens ─────────────────────────────────
export const listInviteTokens = async (req, res) => {
  try {
    const adminSecret = req.headers["x-admin-secret"];
    if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ success: false, message: "Unauthorized." });
    }

    const tokens = await InviteToken.find()
      .populate("usedBy", "name email")
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json({ success: true, tokens });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch tokens." });
  }
};

// ── GET PROFILE ───────────────────────────────────────────────
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.id).select("-password -emailVerifyToken -passwordResetToken").populate("enrolledCourses");
    if (!user) return res.status(404).json({ message: "Profile not found", success: false });
    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to load user" });
  }
};

// ── UPDATE PROFILE ────────────────────────────────────────────
export const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findById(req.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    if (name) user.name = name.trim();

    if (req.file) {
      if (user.photoUrl) {
        const publicId = user.photoUrl.split("/").pop().split(".")[0];
        await deleteMediaFromCloudinary(publicId).catch(() => {});
      }
      const uploaded = await uploadMedia(req.file.path);
      user.photoUrl  = uploaded.secure_url;
    }

    await user.save();
    const updated = await User.findById(req.id).select("-password -emailVerifyToken -passwordResetToken");
    return res.status(200).json({ success: true, user: updated, message: "Profile updated." });
  } catch (error) {
    console.error("updateProfile:", error);
    return res.status(500).json({ success: false, message: "Failed to update profile." });
  }
};

// ── GET ENROLLED COURSES ──────────────────────────────────────
export const getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.id;
    const user   = await User.findById(userId).select("enrolledCourses");
    const enrolledSet = new Set((user?.enrolledCourses || []).map((id) => id.toString()));

    const completedPurchases = await CoursePurchase.find({ userId, status: "completed" }).select("courseId");
    const purchasedIds       = completedPurchases.map((p) => p.courseId.toString());
    const toSync             = purchasedIds.filter((id) => !enrolledSet.has(id));

    if (toSync.length > 0) {
      await User.findByIdAndUpdate(userId, { $addToSet: { enrolledCourses: { $each: toSync } } });
      await Course.updateMany({ _id: { $in: toSync } }, { $addToSet: { enrolledStudents: userId } });
      toSync.forEach((id) => enrolledSet.add(id));
    }

    const allIds = [...enrolledSet];
    if (allIds.length === 0) return res.status(200).json({ success: true, courses: [] });

    const courses = await Course.find({ _id: { $in: allIds } })
      .populate("creator", "name photoUrl")
      .select("courseTitle thumbnail description creator lectures category level");

    return res.status(200).json({ success: true, courses });
  } catch (error) {
    console.error("getEnrolledCourses:", error);
    return res.status(500).json({ success: false, message: "Failed to load enrolled courses." });
  }
};