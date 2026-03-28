import express from "express";
import {
  register,
  registerInstructor,
  login,
  logout,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  validateInviteToken,
  generateInviteToken,
  listInviteTokens,
  getUserProfile,
  updateProfile,
  getEnrolledCourses,
} from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload          from "../utils/multer.js";

const router = express.Router();

// ── Public auth ───────────────────────────────────────────────
router.post("/register",               register);               // Students only
router.post("/register/instructor",    registerInstructor);     // Instructors — invite token required
router.post("/login",                  login);
router.get("/logout",                  logout);

// ── Email verification ────────────────────────────────────────
router.get("/verify-email",            verifyEmail);            // GET ?token=xxx
router.post("/resend-verification",    resendVerification);     // POST { email }

// ── Password reset ────────────────────────────────────────────
router.post("/forgot-password",        forgotPassword);         // POST { email }
router.post("/reset-password",         resetPassword);          // POST { token, password }

// ── Invite token (public check) ───────────────────────────────
router.get("/invite/validate",         validateInviteToken);    // GET ?token=xxx

// ── Admin only (protected by X-Admin-Secret header) ──────────
router.post("/admin/invite",           generateInviteToken);    // POST { label?, email?, expiryDays? }
router.get("/admin/invites",           listInviteTokens);

// ── Protected user routes ─────────────────────────────────────
router.get("/profile",                 isAuthenticated, getUserProfile);
router.get("/enrolled-courses",        isAuthenticated, getEnrolledCourses);
router.put("/profile/update",          isAuthenticated, upload.single("profilePhoto"), updateProfile);

export default router;