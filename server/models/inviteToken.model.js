import mongoose from "mongoose";

/**
 * InviteToken — one-time invite codes for instructor registration.
 *
 * Flow:
 *   1. Admin calls POST /api/v1/user/admin/invite  → gets back a token
 *   2. Admin shares that token with the intended teacher (via email / WhatsApp etc.)
 *   3. Teacher opens /teacher-signup?token=<TOKEN> and signs up
 *   4. Token is marked used=true after successful registration
 *
 * Without a valid token, instructor signup is REJECTED server-side.
 * Knowing the URL alone is NOT enough — the token is required.
 */
const inviteTokenSchema = new mongoose.Schema(
  {
    token:     { type: String,  required: true, unique: true },
    // Who this invite was intended for (optional label set by admin)
    label:     { type: String,  default: "" },
    used:      { type: Boolean, default: false },
    usedBy:    { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    usedAt:    { type: Date,    default: null },
    // Expiry — default 7 days from creation
    expiresAt: { type: Date,    required: true },
    createdBy: { type: String,  default: "admin" },
  },
  { timestamps: true }
);

export const InviteToken = mongoose.model("InviteToken", inviteTokenSchema);