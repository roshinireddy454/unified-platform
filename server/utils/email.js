import nodemailer from "nodemailer";

// ── Create transporter from .env config ───────────────────────
function createTransporter() {
  return nodemailer.createTransport({
    host:   process.env.EMAIL_HOST   || "smtp.gmail.com",
    port:   parseInt(process.env.EMAIL_PORT || "587"),
    secure: process.env.EMAIL_PORT === "465", // true for 465, false for others
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

const FROM = `"LearnSphere" <${process.env.EMAIL_USER}>`;
const APP  = process.env.FRONTEND_URL || "http://localhost:5173";

// ── Send email verification ───────────────────────────────────
export const sendVerificationEmail = async (email, name, token) => {
  const link = `${APP}/verify-email?token=${token}`;
  const transporter = createTransporter();

  await transporter.sendMail({
    from:    FROM,
    to:      email,
    subject: "Verify your LearnSphere account",
    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td align="center" style="padding:40px 20px;">
            <table width="480" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">
              <!-- Header -->
              <tr><td style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:32px;text-align:center;">
                <div style="font-size:28px;margin-bottom:8px;">🎓</div>
                <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;">LearnSphere</h1>
                <p style="color:rgba(255,255,255,0.7);margin:4px 0 0;font-size:13px;">Unified Learning Platform</p>
              </td></tr>
              <!-- Body -->
              <tr><td style="padding:36px 32px;">
                <h2 style="color:#f1f5f9;margin:0 0 12px;font-size:20px;">Hi ${name}! 👋</h2>
                <p style="color:#94a3b8;margin:0 0 24px;line-height:1.6;">
                  Welcome to LearnSphere! Please verify your email address to activate your account.
                </p>
                <div style="text-align:center;margin:28px 0;">
                  <a href="${link}" style="background:#2563eb;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:600;font-size:15px;display:inline-block;">
                    ✉️ Verify Email Address
                  </a>
                </div>
                <p style="color:#64748b;font-size:12px;margin:20px 0 0;text-align:center;">
                  This link expires in <strong style="color:#94a3b8;">24 hours</strong>.<br/>
                  If you didn't sign up, you can safely ignore this email.
                </p>
                <div style="margin-top:20px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.05);">
                  <p style="color:#475569;font-size:11px;word-break:break-all;text-align:center;">
                    Or paste this link: ${link}
                  </p>
                </div>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `,
  });
};

// ── Send teacher invite ───────────────────────────────────────
export const sendTeacherInviteEmail = async (email, inviteToken, label = "") => {
  const link = `${APP}/teacher-signup?token=${inviteToken}`;
  const transporter = createTransporter();

  await transporter.sendMail({
    from:    FROM,
    to:      email,
    subject: "You're invited to join LearnSphere as an Instructor",
    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td align="center" style="padding:40px 20px;">
            <table width="480" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">
              <tr><td style="background:linear-gradient(135deg,#059669,#047857);padding:32px;text-align:center;">
                <div style="font-size:28px;margin-bottom:8px;">🏫</div>
                <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;">Instructor Invitation</h1>
                <p style="color:rgba(255,255,255,0.7);margin:4px 0 0;font-size:13px;">LearnSphere Platform</p>
              </td></tr>
              <tr><td style="padding:36px 32px;">
                ${label ? `<p style="color:#94a3b8;margin:0 0 8px;">For: <strong style="color:#f1f5f9;">${label}</strong></p>` : ""}
                <h2 style="color:#f1f5f9;margin:0 0 12px;font-size:20px;">You've been invited! 🎉</h2>
                <p style="color:#94a3b8;margin:0 0 24px;line-height:1.6;">
                  You've been invited to join LearnSphere as an <strong style="color:#34d399;">Instructor</strong>.
                  Use the button below to create your account. This invite is valid for <strong style="color:#f1f5f9;">7 days</strong>.
                </p>
                <div style="text-align:center;margin:28px 0;">
                  <a href="${link}" style="background:#059669;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:600;font-size:15px;display:inline-block;">
                    🚀 Create Instructor Account
                  </a>
                </div>
                <p style="color:#64748b;font-size:12px;margin:20px 0 0;text-align:center;">
                  This invite link is single-use and expires in 7 days.
                </p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `,
  });
};

// ── Send password reset ───────────────────────────────────────
export const sendPasswordResetEmail = async (email, name, token) => {
  const link = `${APP}/reset-password?token=${token}`;
  const transporter = createTransporter();

  await transporter.sendMail({
    from:    FROM,
    to:      email,
    subject: "Reset your LearnSphere password",
    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td align="center" style="padding:40px 20px;">
            <table width="480" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">
              <tr><td style="background:linear-gradient(135deg,#dc2626,#b91c1c);padding:32px;text-align:center;">
                <div style="font-size:28px;margin-bottom:8px;">🔐</div>
                <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;">Password Reset</h1>
              </td></tr>
              <tr><td style="padding:36px 32px;">
                <h2 style="color:#f1f5f9;margin:0 0 12px;font-size:20px;">Hi ${name},</h2>
                <p style="color:#94a3b8;margin:0 0 24px;line-height:1.6;">
                  You requested a password reset. Click the button below. This link expires in <strong style="color:#f1f5f9;">1 hour</strong>.
                </p>
                <div style="text-align:center;margin:28px 0;">
                  <a href="${link}" style="background:#dc2626;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:600;font-size:15px;display:inline-block;">
                    🔑 Reset Password
                  </a>
                </div>
                <p style="color:#64748b;font-size:12px;margin:20px 0 0;text-align:center;">
                  If you didn't request this, ignore this email. Your password won't change.
                </p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `,
  });
};