import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { GraduationCap, Video, BookOpen, Users, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        await login(form.email, form.password);
        toast.success("Welcome back!");
        navigate("/");
      } else {
        const data = await register(form.name, form.email, form.password, form.role);
        toast.success(data.message || "Account created!");
        setMode("login");
        setForm({ name: "", email: form.email, password: "" });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: BookOpen, title: "Structured Courses", desc: "Access curated learning paths" },
    { icon: Video, title: "Live Video Classes", desc: "Join real-time sessions" },
    { icon: Users, title: "Auto Attendance", desc: "Automatically tracked" },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[52%] bg-navy-900 p-12 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
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
            {["A", "B", "C", "D"].map((l, i) => (
              <div key={l} className="w-8 h-8 rounded-full border-2 border-navy-900 flex items-center justify-center text-xs font-semibold"
                style={{ background: `hsl(${210 + i * 30}, 70%, 50%)` }}>{l}</div>
            ))}
          </div>
          <span className="text-white/40 text-xs">Trusted by thousands of learners</span>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-azure-500 to-azure-600 flex items-center justify-center">
              <GraduationCap size={18} className="text-white" />
            </div>
            <span className="font-display text-xl font-semibold text-white">LearnSphere</span>
          </div>

          <div className="mb-8">
            <h2 className="font-display text-2xl font-semibold text-white mb-1">
              {mode === "login" ? "Welcome back" : "Create account"}
            </h2>
            <p className="text-white/40 text-sm">
              {mode === "login" ? "Sign in to continue your learning journey" : "Start your learning journey today"}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex bg-navy-900/60 rounded-xl p-1 mb-6 border border-white/5">
            {["login", "register"].map((m) => (
              <button key={m} onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize ${
                  mode === m ? "bg-azure-600 text-white shadow-glow" : "text-white/40 hover:text-white/70"
                }`}>{m === "login" ? "Sign In" : "Sign Up"}</button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="label">Full Name</label>
                <input className="input" type="text" placeholder="John Doe" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
            )}
            {mode === "register" && (
              <div>
                <label className="label">I want to join as</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "student", label: "Student", desc: "Enroll & learn", icon: "🎓" },
                    { value: "instructor", label: "Instructor", desc: "Create & teach", icon: "🏫" },
                  ].map(({ value, label, desc, icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setForm({ ...form, role: value })}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all text-center ${
                        form.role === value
                          ? "bg-azure-600/20 border-azure-500/60 text-white"
                          : "bg-white/3 border-white/10 text-white/50 hover:border-white/20 hover:text-white/70"
                      }`}
                    >
                      <span className="text-xl">{icon}</span>
                      <span className="text-sm font-medium">{label}</span>
                      <span className="text-xs opacity-60">{desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div>
              <label className="label">Email Address</label>
              <input className="input" type="email" placeholder="you@example.com" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input className="input pr-12" type={showPwd ? "text" : "password"} placeholder="••••••••" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {mode === "login" ? "Sign In" : "Create Account"}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-white/30 text-xs mt-6">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => setMode(mode === "login" ? "register" : "login")} className="text-azure-400 hover:text-azure-300 font-medium">
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
