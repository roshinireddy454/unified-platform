import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  LayoutDashboard,
  BookOpen,
  Video,
  Users,
  FileText,
  User,
  LogOut,
  GraduationCap,
  ChevronRight,
  Menu,
  X,
  MessageCircle,
  Award,
  Bot,
  UserCheck,
  Library,
  ListTodo,
  ClipboardList,
  HelpCircle,
  Sun,
  Moon,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import NotificationBell from "./NotificationBell";

export default function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const location         = useLocation();
  const navigate         = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isInstructor = user?.role === "instructor";

  const navItems = [
    { path: "/",                   label: "Dashboard",          icon: LayoutDashboard, roles: ["instructor", "student"] },
    { path: "/courses",            label: "All Courses",        icon: BookOpen,        roles: ["instructor", "student"] },
    { path: "/my-courses",         label: "My Courses",         icon: Library,         roles: ["student"]               },
    { path: "/meetings",           label: "Classes",            icon: Video,           roles: ["instructor", "student"] },
    { path: "/attendance",         label: "Attendance",         icon: Users,           roles: ["instructor", "student"] },
    { path: "/summaries",          label: "Summaries",          icon: FileText,        roles: ["instructor", "student"] },
    {
      path:  "/doubts",
      label: isInstructor ? "Student Doubts" : "My Doubts",
      icon:  MessageCircle,
      roles: ["instructor", "student"],
    },
    { path: "/chatbot",            label: "AI Assistant",       icon: Bot,             roles: ["instructor", "student"] },
    // ── Instructor-only ──────────────────────────────────────
    { path: "/enrolled-students",  label: "Enrolled Students",  icon: UserCheck,       roles: ["instructor"]            },
    { path: "/test-manager",       label: "Test Manager",       icon: ClipboardList,   roles: ["instructor"]            },
    { path: "/question-bank",      label: "Question Bank",      icon: HelpCircle,      roles: ["instructor"]            },
    // ── Student-only ─────────────────────────────────────────
    { path: "/certificates",       label: "Certificates",       icon: Award,           roles: ["student"]               },
    { path: "/my-tests",           label: "My Tests",           icon: ClipboardList,   roles: ["student"]               },
    { path: "/todo",               label: "My Tasks",           icon: ListTodo,        roles: ["student"]               },
    // ── Both ─────────────────────────────────────────────────
    { path: "/profile",            label: "Profile",            icon: User,            roles: ["instructor", "student"] },
  ].filter((item) => item.roles.includes(user?.role));

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/landing");
  };

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const sidebarBg = isDark ? "bg-slate-900" : "bg-[#1e3a5f]";
  const headerBg  = isDark
    ? "bg-slate-900/50 border-white/5"
    : "bg-white/90 border-slate-200";
  const mainBg    = isDark ? "" : "bg-gray-50";

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className={`p-6 border-b ${isDark ? "border-white/5" : "border-white/10"}`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
            <GraduationCap size={18} className="text-white" />
          </div>
          <div>
            <div className="text-lg font-bold text-white">
              Collab<span className="text-cyan-400">Sphere</span>
            </div>
            <div className="text-xs text-white/40">
              {isInstructor ? "Instructor" : "Student"} Portal
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ path, label, icon: Icon }) => (
          <button
            key={path}
            onClick={() => {
              navigate(path);
              setMobileOpen(false);
            }}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg w-full text-left transition-all ${
              isActive(path)
                ? "bg-blue-600 text-white"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Icon size={17} />
            {label}
            {isActive(path) && <ChevronRight size={14} className="ml-auto" />}
          </button>
        ))}
      </nav>

      <div className={`p-4 border-t ${isDark ? "border-white/5" : "border-white/10"}`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white overflow-hidden flex-shrink-0">
            {user?.photoUrl
              ? <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" />
              : <span className="text-sm font-bold">{user?.name?.[0]?.toUpperCase()}</span>}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-white truncate">{user?.name}</div>
            <div className="text-xs text-white/50 capitalize">{user?.role}</div>
          </div>
          <button onClick={handleLogout} className="text-white/40 hover:text-red-400 flex-shrink-0 transition-colors">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`flex h-screen ${isDark ? "" : "bg-gray-50"}`}>
      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex flex-col w-64 ${sidebarBg} text-white flex-shrink-0`}>
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className={`relative w-64 ${sidebarBg} text-white z-10`}>
            <button
              className="absolute top-4 right-4 text-white/40 hover:text-white z-10"
              onClick={() => setMobileOpen(false)}
            >
              <X size={20} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className={`flex items-center justify-between px-6 py-4 border-b backdrop-blur-sm flex-shrink-0 ${headerBg}`}>
          <button
            onClick={() => setMobileOpen(true)}
            className={`lg:hidden transition-colors ${isDark ? "text-white/50 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-3 ml-auto">
            <div className={`capitalize text-sm ${isDark ? "text-white/50" : "text-slate-500"}`}>{user?.role}</div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl transition-colors ${isDark ? "text-white/50 hover:text-white hover:bg-white/8" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"}`}
              title={isDark ? "Switch to Light mode" : "Switch to Dark mode"}
            >
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Notification Bell — fixed z-index */}
            <NotificationBell />
          </div>
        </header>

        <main className={`flex-1 overflow-y-auto p-6 ${mainBg}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}