import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  GraduationCap, Video, BookOpen, Users, BarChart2,
  MessageCircle, Bot, Award, ClipboardList, ChevronRight,
  Play, Star, Check, ArrowRight, Menu, X, Zap,
  Shield, Globe, Clock, FileText, PenLine, Sun, Moon,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const FEATURES = [
  {
    icon: Video,
    color: "from-blue-500 to-cyan-500",
    title: "Live Classes",
    desc: "Host or join real-time video classes with whiteboard, polls, breakout rooms, and AI-generated summaries.",
  },
  {
    icon: BookOpen,
    color: "from-emerald-500 to-teal-500",
    title: "Course Management",
    desc: "Create and publish structured courses with video lectures, thumbnails, and progress tracking.",
  },
  {
    icon: Bot,
    color: "from-violet-500 to-purple-500",
    title: "AI Assistant",
    desc: "Get instant answers, generate summaries, and get help with any subject using our built-in AI chatbot.",
  },
  {
    icon: ClipboardList,
    color: "from-amber-500 to-orange-500",
    title: "Tests & Assessments",
    desc: "Create tests from a question bank, manage submissions, and automatically grade student answers.",
  },
  {
    icon: MessageCircle,
    color: "from-rose-500 to-pink-500",
    title: "Doubt Resolution",
    desc: "Students ask questions, instructors respond — a dedicated Q&A thread per topic keeps learning organized.",
  },
  {
    icon: BarChart2,
    color: "from-sky-500 to-blue-500",
    title: "Attendance & Analytics",
    desc: "Automatic attendance tracking for every live class, with export options and session reports.",
  },
  {
    icon: PenLine,
    color: "from-indigo-500 to-violet-500",
    title: "Live Whiteboard",
    desc: "Draw, annotate, and collaborate in real time. Students see exactly what the instructor writes.",
  },
  {
    icon: Award,
    color: "from-yellow-500 to-amber-500",
    title: "Certificates",
    desc: "Automatically generate completion certificates when students finish a course.",
  },
];

const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    role: "Computer Science Instructor",
    text: "CollabSphere transformed how I run my online classes. The whiteboard syncs in real time and the AI summaries save me hours every week.",
    rating: 5,
  },
  {
    name: "Arjun Mehta",
    role: "Student, B.Tech",
    text: "The live polling and breakout rooms make every class feel interactive. I never miss a session because the recordings are always available.",
    rating: 5,
  },
  {
    name: "Dr. Srilatha Reddy",
    role: "Head of Department",
    text: "Finally a platform built for serious educators. The attendance analytics and test manager are exactly what our department needed.",
    rating: 5,
  },
];

const STATS = [
  { value: "10K+", label: "Active Students" },
  { value: "500+", label: "Instructors" },
  { value: "50K+", label: "Classes Hosted" },
  { value: "99.9%", label: "Uptime" },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme, isDark } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authModal, setAuthModal] = useState(null); // 'login' | 'signup'

  const goToAuth = (mode) => {
    navigate("/auth", { state: { mode } });
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-slate-950 text-white" : "bg-gray-50 text-slate-900"}`}>
      {/* ── HEADER ── */}
      <header className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-colors ${isDark ? "bg-slate-950/90 border-white/8" : "bg-white/90 border-slate-200"}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg">
              <GraduationCap size={18} className="text-white" />
            </div>
            <span className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
              Collab<span className="text-blue-500">Sphere</span>
            </span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {["Features", "How it works", "Testimonials"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s/g, "-")}`}
                className={`text-sm transition-colors hover:text-blue-500 ${isDark ? "text-white/60" : "text-slate-600"}`}
              >
                {item}
              </a>
            ))}
          </nav>

          {/* CTA + theme toggle */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl transition-colors ${isDark ? "text-white/50 hover:text-white hover:bg-white/8" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"}`}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => goToAuth("login")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${isDark ? "text-white/70 hover:text-white border border-white/10 hover:bg-white/8" : "text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-100"}`}
            >
              Sign In
            </button>
            <button
              onClick={() => goToAuth("signup")}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all shadow-lg shadow-blue-500/25"
            >
              Get Started Free
            </button>
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button onClick={toggleTheme} className={`p-2 rounded-xl ${isDark ? "text-white/50" : "text-slate-500"}`}>
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`p-2 rounded-xl ${isDark ? "text-white/60" : "text-slate-600"}`}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className={`md:hidden px-6 pb-4 border-t ${isDark ? "border-white/5" : "border-slate-200"}`}>
            <nav className="flex flex-col gap-3 pt-3">
              {["Features", "How it works", "Testimonials"].map((item) => (
                <a key={item} href={`#${item.toLowerCase().replace(/\s/g, "-")}`}
                  className={`text-sm py-2 ${isDark ? "text-white/60" : "text-slate-600"}`}
                  onClick={() => setMobileOpen(false)}>
                  {item}
                </a>
              ))}
              <div className="flex flex-col gap-2 pt-2">
                <button onClick={() => goToAuth("login")}
                  className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${isDark ? "text-white/70 border-white/10" : "text-slate-700 border-slate-200"}`}>
                  Sign In
                </button>
                <button onClick={() => goToAuth("signup")}
                  className="py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium">
                  Get Started Free
                </button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium mb-8 border"
          style={{ background: isDark ? "rgba(37,99,235,0.1)" : "rgba(37,99,235,0.06)", borderColor: isDark ? "rgba(37,99,235,0.3)" : "rgba(37,99,235,0.2)", color: "#3b82f6" }}>
          <Zap size={12} />
          Unified Learning Platform for the Modern Classroom
        </div>

        <h1 className={`text-5xl md:text-7xl font-extrabold leading-tight mb-6 ${isDark ? "text-white" : "text-slate-900"}`}>
          Where Learning
          <br />
          <span className="bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            Comes Alive
          </span>
        </h1>

        <p className={`text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed ${isDark ? "text-white/55" : "text-slate-600"}`}>
          CollabSphere brings live classes, courses, AI-powered summaries, tests, and attendance
          tracking into one seamless platform — for instructors and students alike.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => goToAuth("signup")}
            className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-base font-semibold shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all hover:-translate-y-0.5"
          >
            Start for Free <ArrowRight size={18} />
          </button>
          <button
            onClick={() => goToAuth("login")}
            className={`flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-medium border transition-all hover:-translate-y-0.5 ${isDark ? "text-white/80 border-white/15 hover:border-white/30 bg-white/5" : "text-slate-700 border-slate-300 hover:border-slate-400 bg-white"}`}
          >
            <Play size={16} fill="currentColor" /> Sign In
          </button>
        </div>

        {/* Hero visual */}
        <div className={`mt-16 rounded-3xl border overflow-hidden shadow-2xl max-w-5xl mx-auto ${isDark ? "border-white/8 bg-slate-900/80" : "border-slate-200 bg-white"}`}>
          <div className={`flex items-center gap-2 px-5 py-3 border-b ${isDark ? "bg-white/3 border-white/5" : "bg-slate-50 border-slate-200"}`}>
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            <div className={`flex-1 ml-2 h-6 rounded-lg max-w-xs ${isDark ? "bg-white/5" : "bg-slate-200"}`} />
          </div>
          <div className={`grid grid-cols-12 h-72 ${isDark ? "" : "bg-white"}`}>
            {/* Sidebar mock */}
            <div className={`col-span-2 border-r p-3 space-y-2 ${isDark ? "bg-slate-900 border-white/5" : "bg-slate-800 border-slate-300"}`}>
              {["Dashboard","Courses","Classes","Summaries","Tests"].map((item, i) => (
                <div key={item} className={`h-7 rounded-lg flex items-center px-2 ${i === 0 ? "bg-blue-600" : (isDark ? "bg-white/5" : "bg-white/10")} transition-colors`}>
                  <div className={`h-2 rounded w-${i === 0 ? 12 : 8} ${isDark ? "bg-white/30" : "bg-white/40"}`} />
                </div>
              ))}
            </div>
            {/* Main mock */}
            <div className={`col-span-10 p-5 ${isDark ? "" : "bg-gray-50"}`}>
              <div className={`h-6 rounded-lg w-1/3 mb-4 ${isDark ? "bg-white/8" : "bg-slate-200"}`} />
              <div className="grid grid-cols-4 gap-3 mb-4">
                {["bg-blue-500/20","bg-emerald-500/20","bg-amber-500/20","bg-violet-500/20"].map((c, i) => (
                  <div key={i} className={`h-16 rounded-xl ${c} border ${isDark ? "border-white/5" : "border-slate-200"}`} />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[0,1].map((i) => (
                  <div key={i} className={`h-20 rounded-xl border p-3 space-y-2 ${isDark ? "bg-white/3 border-white/5" : "bg-white border-slate-200"}`}>
                    <div className={`h-2 rounded w-2/3 ${isDark ? "bg-white/15" : "bg-slate-200"}`} />
                    <div className={`h-2 rounded w-full ${isDark ? "bg-white/8" : "bg-slate-100"}`} />
                    <div className={`h-2 rounded w-4/5 ${isDark ? "bg-white/8" : "bg-slate-100"}`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className={`border-y py-14 ${isDark ? "border-white/6 bg-white/2" : "border-slate-200 bg-white"}`}>
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map(({ value, label }) => (
            <div key={label}>
              <div className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-1">
                {value}
              </div>
              <div className={`text-sm ${isDark ? "text-white/45" : "text-slate-500"}`}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <div className="text-sm font-semibold text-blue-500 mb-3 uppercase tracking-widest">Everything you need</div>
          <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
            Built for real classrooms
          </h2>
          <p className={`text-lg max-w-xl mx-auto ${isDark ? "text-white/50" : "text-slate-600"}`}>
            Every feature was designed with instructors and students in mind.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map(({ icon: Icon, color, title, desc }) => (
            <div key={title}
              className={`group p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 ${isDark ? "bg-white/3 border-white/6 hover:border-white/15 hover:bg-white/5" : "bg-white border-slate-200 hover:border-blue-300 hover:shadow-lg"}`}>
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-lg`}>
                <Icon size={22} className="text-white" />
              </div>
              <h3 className={`font-semibold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>{title}</h3>
              <p className={`text-sm leading-relaxed ${isDark ? "text-white/45" : "text-slate-600"}`}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className={`py-24 border-y ${isDark ? "bg-white/2 border-white/6" : "bg-slate-50 border-slate-200"}`}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className={`text-4xl font-bold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>Get started in minutes</h2>
            <p className={isDark ? "text-white/50" : "text-slate-600"}>No setup complexity — just sign up and start teaching or learning.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Create your account", desc: "Sign up as a student or instructor. Email verified in seconds.", icon: Shield },
              { step: "02", title: "Set up your class", desc: "Instructors create courses and schedule live classes. Students browse and enroll.", icon: BookOpen },
              { step: "03", title: "Learn together", desc: "Join live sessions, take tests, ask doubts, and track your progress.", icon: Users },
            ].map(({ step, title, desc, icon: Icon }) => (
              <div key={step} className="relative text-center">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 font-bold text-xl ${isDark ? "bg-blue-500/15 text-blue-400" : "bg-blue-100 text-blue-600"}`}>
                  <Icon size={28} />
                </div>
                <div className={`text-xs font-bold mb-2 ${isDark ? "text-white/25" : "text-slate-400"}`}>STEP {step}</div>
                <h3 className={`font-semibold text-lg mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>{title}</h3>
                <p className={`text-sm leading-relaxed ${isDark ? "text-white/45" : "text-slate-600"}`}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className={`text-4xl font-bold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>Loved by educators</h2>
          <p className={isDark ? "text-white/50" : "text-slate-600"}>Hear from instructors and students who use CollabSphere every day.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(({ name, role, text, rating }) => (
            <div key={name}
              className={`p-6 rounded-2xl border transition-all ${isDark ? "bg-white/3 border-white/6" : "bg-white border-slate-200 shadow-sm"}`}>
              <div className="flex gap-1 mb-4">
                {Array.from({ length: rating }).map((_, i) => (
                  <Star key={i} size={14} className="text-amber-400" fill="currentColor" />
                ))}
              </div>
              <p className={`text-sm leading-relaxed mb-5 ${isDark ? "text-white/65" : "text-slate-700"}`}>"{text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                  {name[0]}
                </div>
                <div>
                  <div className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{name}</div>
                  <div className={`text-xs ${isDark ? "text-white/40" : "text-slate-500"}`}>{role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <div className={`p-12 rounded-3xl border ${isDark ? "bg-gradient-to-br from-blue-600/15 to-cyan-600/10 border-blue-500/20" : "bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200"}`}>
          <h2 className={`text-4xl font-bold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
            Ready to transform your classroom?
          </h2>
          <p className={`text-lg mb-8 max-w-xl mx-auto ${isDark ? "text-white/55" : "text-slate-600"}`}>
            Join thousands of instructors and students already using CollabSphere.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => goToAuth("signup")}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-base font-semibold shadow-lg shadow-blue-500/30 transition-all"
            >
              Get Started Free <ArrowRight size={18} />
            </button>
            <button
              onClick={() => goToAuth("login")}
              className={`flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-medium border transition-all ${isDark ? "text-white/70 border-white/20 hover:bg-white/8" : "text-slate-700 border-slate-300 hover:bg-white"}`}
            >
              Sign In <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className={`border-t py-10 ${isDark ? "border-white/6" : "border-slate-200"}`}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
              <GraduationCap size={15} className="text-white" />
            </div>
            <span className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
              Collab<span className="text-blue-500">Sphere</span>
            </span>
          </div>
          <p className={`text-sm ${isDark ? "text-white/30" : "text-slate-500"}`}>
            © 2026 CollabSphere. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {["Privacy", "Terms", "Contact"].map((item) => (
              <a key={item} href="#" className={`text-sm transition-colors hover:text-blue-500 ${isDark ? "text-white/35" : "text-slate-500"}`}>
                {item}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}