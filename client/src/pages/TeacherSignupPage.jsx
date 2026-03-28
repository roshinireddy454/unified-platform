import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  GraduationCap, Eye, EyeOff, ArrowRight,
  CheckCircle2, Circle, ShieldCheck, AlertTriangle,
  Loader, Lock,
} from "lucide-react";

// ── Password rules (identical to student signup) ───────────────
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
  const color  =
    passed <= 1 ? "bg-rose-500" :
    passed <= 2 ? "bg-amber-500" :
    passed <= 3 ? "bg-yellow-400" :
    passed <= 4 ? "bg-lime-400"  :
                  "bg-emerald-500";

  if (!password) return null;
  return (
    <div className="mt-3 space-y-2">
      <div className="h-1 rounded-full bg-white/8 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-300 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="grid grid-cols-1 gap-1.5">
        {PASSWORD_RULES.map((rule) => {
          const ok = rule.test(password);
          return (
            <div key={rule.id} className={`flex items-center gap-2 text-xs transition-colors ${ok ? "text-emerald-400" : "text-white/35"}`}>
              {ok ? <CheckCircle2 size={12} className="flex-shrink-0" /> : <Circle size={12} className="flex-shrink-0" />}
              {rule.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Token validation states ────────────────────────────────────
const STATE = { CHECKING: "checking", VALID: "valid", INVALID: "invalid", NO_TOKEN: "no_token" };

export default function TeacherSignupPage() {
  const [searchParams]        = useSearchParams();
  const navigate              = useNavigate();
  const inviteToken           = searchParams.get("token") || "";

  const [tokenState, setTokenState] = useState(STATE.CHECKING);
  const [tokenLabel, setTokenLabel] = useState("");
  const [form, setForm]             = useState({ name: "", email: "", password: "" });
  const [showPwd, setShowPwd]       = useState(false);
  const [loading, setLoading]       = useState(false);

  const f = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));
  const allRulesPassed = PASSWORD_RULES.every((r) => r.test(form.password));

  // ── Validate token on mount ──────────────────────────────────
  useEffect(() => {
    if (!inviteToken) { setTokenState(STATE.NO_TOKEN); return; }

    const validate = async () => {
      try {
        const { data } = await axios.get(`/api/v1/user/invite/validate?token=${inviteToken}`);
        if (data.valid) {
          setTokenState(STATE.VALID);
          setTokenLabel(data.label || "");
        } else {
          setTokenState(STATE.INVALID);
        }
      } catch {
        setTokenState(STATE.INVALID);
      }
    };
    validate();
  }, [inviteToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!allRulesPassed) { toast.error("Please meet all password requirements."); return; }
    setLoading(true);
    try {
      const { data } = await axios.post("/api/v1/user/register/instructor", {
        name:        form.name,
        email:       form.email,
        password:    form.password,
        inviteToken,
      });
      toast.success(data.message || "Instructor account created! Please verify your email.");
      navigate("/auth");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  // ── State: no token in URL ────────────────────────────────────
  if (tokenState === STATE.NO_TOKEN) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center p-6">
        <div className="bg-navy-900 border border-white/10 rounded-2xl max-w-md w-full p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-500/15 flex items-center justify-center mx-auto mb-5">
            <Lock size={28} className="text-amber-400" />
          </div>
          <h2 className="font-display text-xl font-semibold text-white mb-3">Invite Required</h2>
          <p className="text-white/40 text-sm leading-relaxed mb-6">
            Instructor registration requires an invite token from the administrator.
            You cannot access this page directly — the token must be included in the link.
          </p>
          <p className="text-white/25 text-xs mb-6">
            If you are a student, please sign up on the regular page below.
          </p>
          <Link to="/auth" className="btn-primary w-full flex items-center justify-center gap-2 text-sm">
            <GraduationCap size={15} /> Go to Student Signup
          </Link>
        </div>
      </div>
    );
  }

  // ── State: checking ───────────────────────────────────────────
  if (tokenState === STATE.CHECKING) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader size={32} className="text-azure-400 animate-spin" />
          <p className="text-white/40 text-sm">Validating your invite…</p>
        </div>
      </div>
    );
  }

  // ── State: invalid token ──────────────────────────────────────
  if (tokenState === STATE.INVALID) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center p-6">
        <div className="bg-navy-900 border border-rose-500/20 rounded-2xl max-w-md w-full p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-rose-500/15 flex items-center justify-center mx-auto mb-5">
            <AlertTriangle size={28} className="text-rose-400" />
          </div>
          <h2 className="font-display text-xl font-semibold text-white mb-3">Invalid Invite</h2>
          <p className="text-white/40 text-sm leading-relaxed mb-6">
            This invite link is <strong className="text-rose-400">invalid, expired, or has already been used</strong>.
            Please contact your administrator to get a new invite.
          </p>
          <Link to="/auth" className="btn-secondary w-full flex items-center justify-center gap-2 text-sm">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  // ── State: valid — show signup form ───────────────────────────
  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md animate-fade-in py-8">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
            <GraduationCap size={20} className="text-white" />
          </div>
          <span className="font-display text-xl font-semibold text-white">LearnSphere</span>
        </div>

        {/* Invite confirmed banner */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 mb-8">
          <ShieldCheck size={18} className="text-emerald-400 flex-shrink-0" />
          <div>
            <p className="text-emerald-300 text-sm font-medium">Valid Instructor Invite ✓</p>
            {tokenLabel && (
              <p className="text-emerald-400/60 text-xs mt-0.5">Invite for: {tokenLabel}</p>
            )}
            <p className="text-emerald-400/50 text-xs mt-0.5">Complete registration below.</p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="font-display text-2xl font-semibold text-white mb-1">Create Instructor Account</h2>
          <p className="text-white/40 text-sm">You're registering as an instructor on LearnSphere.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input className="input" type="text" placeholder="Dr. Jane Smith"
              value={form.name} onChange={f("name")} required />
          </div>

          <div>
            <label className="label">Email Address</label>
            <input className="input" type="email" placeholder="teacher@school.edu"
              value={form.email} onChange={f("email")} required />
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input
                className="input pr-12"
                type={showPwd ? "text" : "password"}
                placeholder="Create a strong password"
                value={form.password}
                onChange={f("password")}
                required
              />
              <button type="button" onClick={() => setShowPwd((s) => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <PasswordStrengthMeter password={form.password} />
          </div>

          <button
            type="submit"
            disabled={loading || !allRulesPassed}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg, #059669, #047857)" }}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>Create Instructor Account <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        <p className="text-center text-white/30 text-xs mt-6">
          Already have an account?{" "}
          <Link to="/auth" className="text-azure-400 hover:text-azure-300 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}