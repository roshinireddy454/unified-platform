import { useState } from "react";
import { useAuth }  from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  GraduationCap, Video, BookOpen, Users,
  Eye, EyeOff, ArrowRight, CheckCircle2, Circle,
  Mail, RefreshCw,
} from "lucide-react";

// ── Password rules checker ─────────────────────────────────────
const PASSWORD_RULES = [
  { id: "len",     label: "At least 8 characters",           test: (p) => p.length >= 8             },
  { id: "upper",   label: "One uppercase letter (A-Z)",       test: (p) => /[A-Z]/.test(p)            },
  { id: "lower",   label: "One lowercase letter (a-z)",       test: (p) => /[a-z]/.test(p)            },
  { id: "number",  label: "One number (0-9)",                 test: (p) => /\d/.test(p)               },
  { id: "special", label: "One special character (!@#$...)",  test: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
];

function PasswordStrengthMeter({ password }) {
  const passed = PASSWORD_RULES.filter((r) => r.test(password)).length;
  const pct    = (passed / PASSWORD_RULES.length) * 100;
  const color  =
    passed <= 1 ? "bg-rose-500" :
    passed <= 2 ? "bg-amber-500" :
    passed <= 3 ? "bg-yellow-400" :
    passed <= 4 ? "bg-lime-400"  :
                  "bg-emerald-500";

  if (!password) return null;

  return (
    <div className="mt-3 space-y-2">
      {/* Bar */}
      <div className="h-1 rounded-full bg-white/8 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {/* Checklist */}
      <div className="grid grid-cols-1 gap-1.5">
        {PASSWORD_RULES.map((rule) => {
          const ok = rule.test(password);
          return (
            <div key={rule.id} className={`flex items-center gap-2 text-xs transition-colors ${ok ? "text-emerald-400" : "text-white/35"}`}>
              {ok
                ? <CheckCircle2 size={12} className="flex-shrink-0" />
                : <Circle       size={12} className="flex-shrink-0" />}
              {rule.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Resend verification banner ─────────────────────────────────
function ResendBanner({ email, onClose }) {
  const [sending, setSending] = useState(false);
  const [sent,    setSent]    = useState(false);

  const resend = async () => {
    setSending(true);
    try {
      await axios.post("/api/v1/user/resend-verification", { email });
      setSent(true);
      toast.success("Verification email sent!");
    } catch {
      toast.error("Failed to resend. Try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 text-sm">
      <div className="flex items-start gap-3">
        <Mail size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-amber-300 font-medium mb-1">Email not verified</p>
          <p className="text-amber-400/70 text-xs leading-relaxed">
            We sent a verification link to <strong className="text-amber-300">{email}</strong>.
            Check your inbox (and spam folder).
          </p>
          <div className="flex items-center gap-3 mt-3">
            {sent ? (
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <CheckCircle2 size={12} /> Sent! Check your inbox.
              </span>
            ) : (
              <button
                onClick={resend}
                disabled={sending}
                className="flex items-center gap-1.5 text-xs text-amber-300 hover:text-amber-200 transition-colors disabled:opacity-60"
              >
                <RefreshCw size={12} className={sending ? "animate-spin" : ""} />
                {sending ? "Sending…" : "Resend verification email"}
              </button>
            )}
            <button onClick={onClose} className="text-xs text-white/30 hover:text-white/60 transition-colors ml-auto">
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main AuthPage ──────────────────────────────────────────────
export default function AuthPage() {
  const [mode, setMode]       = useState("login");
  const [form, setForm]       = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState(null);

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const f = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const allRulesPassed = PASSWORD_RULES.every((r) => r.test(form.password));
  const canSubmit      = mode === "login" || allRulesPassed;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) {
      toast.error("Please meet all password requirements first.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "login") {
        await login(form.email, form.password);
        toast.success("Welcome back!");
        navigate("/");
      } else {
        const data = await register(form.name, form.email, form.password, "student");
        toast.success(data.message || "Account created! Please verify your email.");
        setMode("login");
        setForm({ name: "", email: form.email, password: "" });
      }
    } catch (err) {
      const res = err.response?.data;
      if (res?.emailNotVerified) {
        setUnverifiedEmail(res.email || form.email);
      } else {
        toast.error(res?.message || err.message || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m) => {
    setMode(m);
    setUnverifiedEmail(null);
    setForm((p) => ({ ...p, name: "", password: "" }));
  };

  const features = [
    { icon: BookOpen, title: "Structured Courses",  desc: "Access curated learning paths"    },
    { icon: Video,    title: "Live Video Classes",   desc: "Join real-time sessions"           },
    { icon: Users,    title: "Auto Attendance",      desc: "Automatically tracked"             },
  ];

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel ────────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-[52%] bg-navy-900 p-12 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-azure-600/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-emerald-500/8 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/3" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-white/3" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-azure-500 to-azure-600 flex items-center justify-center shadow-glow">
              <GraduationCap size={20} className="text-white" />
            </div>
            <span className="font-display text-2xl font-semibold text-white">LearnSphere</span>
          </div>
          <p className="text-white/30 text-sm ml-1">Unified Learning Platform</p>
        </div>

        <div className="relative z-10 space-y-6">
          <div>
            <h1 className="font-display text-4xl font-semibold text-white leading-tight mb-3">
              Learning, teaching,<br />and connecting—
              <span className="text-azure-400"> all in one place.</span>
            </h1>
            <p className="text-white/40 leading-relaxed max-w-sm">
              A seamless platform integrating structured courses with live video conferencing and automatic attendance tracking.
            </p>
          </div>
          <div className="space-y-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center flex-shrink-0">
                  <Icon size={17} className="text-azure-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{title}</div>
                  <div className="text-xs text-white/35">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2">
          <div className="flex -space-x-2">
            {["A","B","C","D"].map((l, i) => (
              <div key={l} className="w-8 h-8 rounded-full border-2 border-navy-900 flex items-center justify-center text-xs font-semibold"
                style={{ background: `hsl(${210 + i * 30},70%,50%)` }}>{l}</div>
            ))}
          </div>
          <span className="text-white/40 text-xs">Trusted by thousands of learners</span>
        </div>
      </div>

      {/* ── Right panel ───────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md animate-fade-in py-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-azure-500 to-azure-600 flex items-center justify-center">
              <GraduationCap size={18} className="text-white" />
            </div>
            <span className="font-display text-xl font-semibold text-white">LearnSphere</span>
          </div>

          <div className="mb-8">
            <h2 className="font-display text-2xl font-semibold text-white mb-1">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h2>
            <p className="text-white/40 text-sm">
              {mode === "login"
                ? "Sign in to continue your learning journey"
                : "Join LearnSphere as a student — free forever"}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex bg-navy-900/60 rounded-xl p-1 mb-6 border border-white/5">
            {[
              { key: "login",    label: "Sign In"  },
              { key: "register", label: "Sign Up"  },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => switchMode(key)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  mode === key ? "bg-azure-600 text-white shadow-glow" : "text-white/40 hover:text-white/70"
                }`}>
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="label">Full Name</label>
                <input className="input" type="text" placeholder="John Doe"
                  value={form.name} onChange={f("name")} required />
              </div>
            )}

            <div>
              <label className="label">Email Address</label>
              <input className="input" type="email" placeholder="you@example.com"
                value={form.email} onChange={f("email")} required />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0">Password</label>
                {mode === "login" && (
                  <Link to="/forgot-password" className="text-xs text-azure-400 hover:text-azure-300 transition-colors">
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <input
                  className="input pr-12"
                  type={showPwd ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={f("password")}
                  required
                />
                <button type="button" onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Real-time password strength — only on signup */}
              {mode === "register" && <PasswordStrengthMeter password={form.password} />}
            </div>

            {/* Unverified email banner */}
            {unverifiedEmail && (
              <ResendBanner email={unverifiedEmail} onClose={() => setUnverifiedEmail(null)} />
            )}

            <button
              type="submit"
              disabled={loading || !canSubmit}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {mode === "login" ? "Sign In" : "Create Student Account"}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-white/30 text-xs mt-6">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => switchMode(mode === "login" ? "register" : "login")}
              className="text-azure-400 hover:text-azure-300 font-medium">
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>

          {/* Teacher signup hint */}
          <p className="text-center text-white/15 text-xs mt-4">
            Are you a teacher?{" "}
            <Link to="/teacher-signup" className="text-white/30 hover:text-white/50 transition-colors">
              Instructor signup →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}