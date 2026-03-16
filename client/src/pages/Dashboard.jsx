import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import {
  BookOpen, Video, Users, TrendingUp, Clock, Plus, ArrowRight,
  Calendar, CheckCircle, Flame, Play, X
} from "lucide-react";

function calculateStreak(attendanceList) {
  if (!attendanceList || attendanceList.length === 0) return 0;
  const uniqueDays = [
    ...new Set(attendanceList.map((a) => new Date(a.joinTime).toDateString())),
  ].sort((a, b) => new Date(b) - new Date(a));

  let streak = 0;
  let checkDate = new Date();
  checkDate.setHours(0, 0, 0, 0);

  for (const day of uniqueDays) {
    const d = new Date(day);
    d.setHours(0, 0, 0, 0);
    const diff = Math.round((checkDate - d) / 86400000);
    if (diff <= 1) { streak++; checkDate = d; }
    else break;
  }
  return streak;
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isInstructor = user?.role === "instructor";

  const [stats, setStats] = useState({ courses: 0, meetings: 0, attendance: 0, streak: 0 });
  const [upcoming, setUpcoming] = useState([]);
  const [recentCourses, setRecentCourses] = useState([]);
  const [liveMeetings, setLiveMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dismissedLive, setDismissedLive] = useState(new Set());

  const fetchData = useCallback(async () => {
    try {
      const [meetingsRes, attendanceRes, liveRes, coursesRes] = await Promise.allSettled([
        axios.get("/api/v1/meeting/upcoming", { withCredentials: true }),
        axios.get("/api/v1/meeting/attendance/my", { withCredentials: true }),
        axios.get("/api/v1/meeting/live", { withCredentials: true }),
        // Instructor: GET /api/v1/course → getCreatorCourses
        // Student: GET /api/v1/user/enrolled-courses → properly populated with lectures
        isInstructor
          ? axios.get("/api/v1/course", { withCredentials: true })
          : axios.get("/api/v1/user/enrolled-courses", { withCredentials: true }),
      ]);

      const meetings = meetingsRes.status === "fulfilled" ? meetingsRes.value.data.meetings || [] : [];
      const attendance = attendanceRes.status === "fulfilled" ? attendanceRes.value.data.attendance || [] : [];
      const live = liveRes.status === "fulfilled" ? liveRes.value.data.meetings || [] : [];

      let courseCount = 0;
      let displayCourses = [];

      if (isInstructor) {
        const allCourses = coursesRes.status === "fulfilled" ? coursesRes.value.data.courses || [] : [];
        courseCount = allCourses.length;
        displayCourses = allCourses.slice(0, 3);
      } else {
        // enrolled-courses endpoint returns { success, courses: [...] }
        const enrolled = coursesRes.status === "fulfilled" ? coursesRes.value.data.courses || [] : [];
        courseCount = enrolled.length;
        displayCourses = enrolled.slice(0, 3);
      }

      const streak = calculateStreak(attendance);

      setStats({ courses: courseCount, meetings: meetings.length, attendance: attendance.length, streak });
      setUpcoming(meetings.slice(0, 3));
      setRecentCourses(displayCourses);
      setLiveMeetings(live.filter((m) => !dismissedLive.has(m.meetingId)));
    } finally {
      setLoading(false);
    }
  }, [isInstructor]); // removed dismissedLive from deps to avoid refetch loop

  useEffect(() => { fetchData(); }, [fetchData]);

  // Poll live meetings
  useEffect(() => {
    const interval = setInterval(() => {
      axios.get("/api/v1/meeting/live", { withCredentials: true })
        .then(({ data }) =>
          setLiveMeetings((data.meetings || []).filter((m) => !dismissedLive.has(m.meetingId)))
        ).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [dismissedLive]);

  const colorMap = {
    azure: "bg-azure-500/15 text-azure-400",
    emerald: "bg-emerald-500/15 text-emerald-400",
    amber: "bg-amber-500/15 text-amber-400",
    rose: "bg-rose-500/15 text-rose-400",
    slate: "bg-white/8 text-white/40",
  };

  const statCards = [
    {
      label: isInstructor ? "Your Courses" : "Enrolled Courses",
      value: stats.courses,
      icon: BookOpen, color: "azure",
      change: isInstructor ? "Created" : "Enrolled",
      onClick: () => navigate("/courses"),
    },
    {
      label: "Upcoming Meetings",
      value: stats.meetings,
      icon: Video, color: "emerald",
      change: "Next 7 days",
      onClick: () => navigate("/meetings"),
    },
    {
      label: "Sessions Attended",
      value: stats.attendance,
      icon: Users, color: "amber",
      change: "All time",
      onClick: () => navigate("/attendance"),
    },
    {
      label: "Learning Streak",
      value: `${stats.streak} ${stats.streak === 1 ? "day" : "days"}`,
      icon: stats.streak >= 3 ? Flame : TrendingUp,
      color: stats.streak >= 3 ? "rose" : "slate",
      change: stats.streak > 0 ? "Keep it up! 🔥" : "Start today!",
      onClick: null,
    },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Live Class Banner (students only) ── */}
      {!isInstructor && liveMeetings.length > 0 && (
        <div className="space-y-2">
          {liveMeetings.map((live) => (
            <div key={live.meetingId}
              className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-emerald-300 font-semibold text-sm">
                  🔴 Live Class: {live.title}
                </p>
                <p className="text-emerald-400/60 text-xs mt-0.5">
                  by {live.createdBy?.name || "Instructor"} — Join now!
                </p>
              </div>
              <button
                onClick={() => navigate(`/meeting/${encodeURIComponent(live.meetingId)}`)}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all flex-shrink-0"
              >
                <Play size={12} fill="currentColor" /> Join Now
              </button>
              <button
                onClick={() => setDismissedLive((p) => new Set([...p, live.meetingId]))}
                className="text-emerald-400/50 hover:text-emerald-300 flex-shrink-0"
              >
                <X size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-white">
            Good {greeting},{" "}
            <span className="text-azure-400">{user?.name?.split(" ")[0]}</span> 👋
          </h1>
          <p className="text-white/40 text-sm mt-1">Here's what's happening on your platform today.</p>
        </div>
        <button
          onClick={() => navigate(isInstructor ? "/meetings" : "/courses")}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          {isInstructor ? <><Plus size={15} /> New Class</> : <><BookOpen size={15} /> My Courses</>}
        </button>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, change, onClick }) => (
          <div
            key={label}
            onClick={onClick}
            className={`stat-card ${onClick ? "cursor-pointer hover:border-white/15 transition-all" : ""}`}
          >
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
                <Icon size={18} />
              </div>
              <span className="text-xs text-white/25">{change}</span>
            </div>
            <div>
              <div className="text-2xl font-semibold font-display text-white">{value}</div>
              <div className="text-xs text-white/40">{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* ── Upcoming Meetings ── */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title text-lg">Upcoming Meetings</h2>
            <button onClick={() => navigate("/meetings")} className="text-azure-400 hover:text-azure-300 text-sm flex items-center gap-1">
              View all <ArrowRight size={13} />
            </button>
          </div>
          {loading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-xl shimmer" />)}</div>
          ) : upcoming.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Calendar size={32} className="text-white/15 mb-3" />
              <p className="text-white/30 text-sm">No upcoming meetings</p>
              <button onClick={() => navigate("/meetings")} className="btn-primary text-sm mt-3 flex items-center gap-1">
                <Plus size={13} /> {isInstructor ? "Schedule one" : "Browse classes"}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map((m) => (
                <div key={m._id} onClick={() => navigate("/meetings")}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/3 hover:bg-white/6 cursor-pointer transition-colors border border-white/5">
                  <div className="w-10 h-10 rounded-xl bg-azure-500/15 flex items-center justify-center flex-shrink-0">
                    <Video size={16} className="text-azure-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{m.title}</div>
                    <div className="text-xs text-white/35 flex items-center gap-1">
                      <Clock size={10} />
                      {m.scheduledAt ? new Date(m.scheduledAt).toLocaleString() : "Instant"}
                    </div>
                  </div>
                  <span className="badge-blue text-xs">{m.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Courses ── */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title text-lg">
              {isInstructor ? "Your Courses" : "Enrolled Courses"}
            </h2>
            <button onClick={() => navigate(isInstructor ? "/courses" : "/my-courses")}
              className="text-azure-400 hover:text-azure-300 text-sm flex items-center gap-1">
              View all <ArrowRight size={13} />
            </button>
          </div>
          {loading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-xl shimmer" />)}</div>
          ) : recentCourses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <BookOpen size={32} className="text-white/15 mb-3" />
              <p className="text-white/30 text-sm">
                {isInstructor ? "No courses created yet" : "No courses enrolled yet"}
              </p>
              <button onClick={() => navigate("/courses")} className="btn-primary text-sm mt-3 flex items-center gap-1">
                {isInstructor ? <><Plus size={13} /> Create course</> : <><BookOpen size={13} /> Browse courses</>}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentCourses.map((c) => (
                <div key={c._id}
                  onClick={() => navigate(isInstructor ? `/courses/editor/${c._id}` : `/course-progress/${c._id}`)}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/3 hover:bg-white/6 cursor-pointer transition-colors border border-white/5">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-navy-800 flex-shrink-0">
                    {c.courseThumbnail
                      ? <img src={c.courseThumbnail} alt={c.courseTitle} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><BookOpen size={16} className="text-white/20" /></div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{c.courseTitle}</div>
                    <div className="text-xs text-white/35">{c.category || "Course"}</div>
                  </div>
                  {isInstructor ? (
                    c.isPublished
                      ? <span className="badge-green text-xs flex items-center gap-1"><CheckCircle size={10} />Live</span>
                      : <span className="badge-amber text-xs">Draft</span>
                  ) : (
                    <span className="badge-blue text-xs">Continue →</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="card p-6">
        <h2 className="section-title text-lg mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(isInstructor ? [
            { label: "Start Instant Class", icon: Video, path: "/meetings", color: "azure" },
            { label: "Manage Courses", icon: BookOpen, path: "/courses", color: "emerald" },
            { label: "Enrolled Students", icon: Users, path: "/enrolled-students", color: "amber" },
            { label: "Class Summaries", icon: TrendingUp, path: "/summaries", color: "rose" },
          ] : [
            { label: "Join a Class", icon: Video, path: "/meetings", color: "azure" },
            { label: "My Courses", icon: BookOpen, path: "/my-courses", color: "emerald" },
            { label: "My Doubts", icon: Users, path: "/doubts", color: "amber" },
            { label: "Certificates", icon: CheckCircle, path: "/certificates", color: "rose" },
          ]).map(({ label, icon: Icon, path, color }) => (
            <button key={label} onClick={() => navigate(path)}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/3 hover:bg-white/6 border border-white/5 hover:border-white/10 transition-all text-center">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
                <Icon size={18} />
              </div>
              <span className="text-xs text-white/60 leading-tight">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}