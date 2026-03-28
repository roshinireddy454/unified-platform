import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  GraduationCap, Mail, ArrowRight, CheckCircle2,
  Eye, EyeOff, Circle, ArrowLeft, Loader,
} from "lucide-react";

// ── Password rules ─────────────────────────────────────────────
const PASSWORD_RULES = [
  { id: "len",     label: "At least 8 characters",          test: (p) => p.length >= 8             },
  { id: "upper",   label: "One uppercase letter (A-Z)",      test: (p) => /[A-Z]/.test(p)            },
  { id: "lower",   label: "One lowercase letter (a-z)",      test: (p) => /[a-z]/.test(p)            },
  { id: "number",  label: "One number (0-9)",                test: (p) => /\d/.test(p)               },
  { id: "special", label: "One special character (!@#$...)", test: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
];

function PasswordStrengthMeter({ password }) {
  const passed = PASSWORD_RULES.filter((r) => r.test(password)).length;
  const pct    = (passed / PASSWORD_RULES.length) * 100;
  const color  = passed <= 2 ? "bg-rose-500" : passed <= 3 ? "bg-amber-500" : passed <= 4 ? "bg-lime-400" : "bg-emerald-500";
  if (!password) return null;
  return (
    <div className="mt-3 space-y-2">
      <div className="h-1 rounded-full bg-white/8 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-300 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="space-y-1.5">
        {PASSWORD_RULES.map((rule) => {
          const ok = rule.test(password);
          return (
            <div key={rule.id} className={`flex items-center gap-2 text-xs ${ok ? "text-emerald-400" : "text-white/35"}`}>
              {ok ? <CheckCircle2 size={12} /> : <Circle size={12} />}
              {rule.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Logo header ────────────────────────────────────────────────
function PageHeader() {
  return (
    <div className="flex items-center gap-3 mb-8 justify-center">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-azure-500 to-azure-600 flex items-center justify-center shadow-glow">
        <GraduationCap size={20} className="text-white" />
      </div>
      <span className="font-display text-xl font-semibold text-white">LearnSphere</span>
    </div>
  );
}

// ── FORGOT PASSWORD ────────────────────────────────────────────
export function ForgotPasswordPage() {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/api/v1/user/forgot-password", { email });
      setSent(true);
    } catch {
      // Show success even on error to avoid email enumeration
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <PageHeader />

        <div className="bg-navy-900 border border-white/10 rounded-2xl p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-azure-500/15 flex items-center justify-center mx-auto mb-5">
                <Mail size={28} className="text-azure-400" />
              </div>
              <h2 className="font-display text-xl font-semibold text-white mb-3">Check your email</h2>
              <p className="text-white/40 text-sm mb-2 leading-relaxed">
                If <strong className="text-white/70">{email}</strong> is registered, we've sent a password reset link.
              </p>
              <p className="text-white/25 text-xs mb-8">
                Check your spam folder if you don't see it within a few minutes.
              </p>
              <Link to="/auth" className="btn-secondary w-full flex items-center justify-center gap-2 text-sm">
                <ArrowLeft size={15} /> Back to Login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="font-display text-xl font-semibold text-white mb-2">Forgot Password?</h2>
              <p className="text-white/40 text-sm mb-6 leading-relaxed">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Email Address</label>
                  <input className="input" type="email" placeholder="you@example.com"
                    value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <button type="submit" disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60">
                  {loading
                    ? <Loader size={15} className="animate-spin" />
                    : <><Mail size={15} /> Send Reset Link</>}
                </button>
              </form>

              <p className="text-center text-white/30 text-xs mt-5">
                Remember your password?{" "}
                <Link to="/auth" className="text-azure-400 hover:text-azure-300 font-medium">Sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── RESET PASSWORD ─────────────────────────────────────────────
export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  const token          = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [done,     setDone]     = useState(false);

  const allRulesPassed = PASSWORD_RULES.every((r) => r.test(password));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!allRulesPassed) { toast.error("Password doesn't meet all requirements."); return; }
    setLoading(true);
    try {
      const { data } = await axios.post("/api/v1/user/reset-password", { token, password });
      toast.success(data.message || "Password reset!");
      setDone(true);
      setTimeout(() => navigate("/auth"), 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center p-6">
        <div className="bg-navy-900 border border-rose-500/20 rounded-2xl max-w-md w-full p-10 text-center">
          <h2 className="font-display text-xl font-semibold text-white mb-3">Invalid Reset Link</h2>
          <p className="text-white/40 text-sm mb-6">This reset link is missing or malformed.</p>
          <Link to="/forgot-password" className="btn-primary w-full flex items-center justify-center gap-2 text-sm">
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <PageHeader />

        <div className="bg-navy-900 border border-white/10 rounded-2xl p-8">
          {done ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 size={28} className="text-emerald-400" />
              </div>
              <h2 className="font-display text-xl font-semibold text-white mb-3">Password Reset!</h2>
              <p className="text-white/40 text-sm mb-8">Redirecting to login…</p>
              <Link to="/auth" className="btn-primary w-full flex items-center justify-center gap-2 text-sm">
                Go to Login <ArrowRight size={15} />
              </Link>
            </div>
          ) : (
            <>
              <h2 className="font-display text-xl font-semibold text-white mb-2">Set New Password</h2>
              <p className="text-white/40 text-sm mb-6">Choose a strong password for your account.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">New Password</label>
                  <div className="relative">
                    <input className="input pr-12" type={showPwd ? "text" : "password"}
                      placeholder="Create a strong password" value={password}
                      onChange={(e) => setPassword(e.target.value)} required />
                    <button type="button" onClick={() => setShowPwd((s) => !s)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <PasswordStrengthMeter password={password} />
                </div>

                <button type="submit" disabled={loading || !allRulesPassed}
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                  {loading ? <Loader size={15} className="animate-spin" /> : <><CheckCircle2 size={15} /> Reset Password</>}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}