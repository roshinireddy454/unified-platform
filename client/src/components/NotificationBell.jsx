import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { io } from "socket.io-client";
import {
  Bell, X, Check, CheckCheck, Trash2,
  BookOpen, CreditCard, GraduationCap, Video,
  MessageCircle, ClipboardList, BarChart2,
  Award, FileText, Users, Info,
} from "lucide-react";

// ── Map notification type → icon + color ──────────────────────
const TYPE_META = {
  course_published:   { icon: BookOpen,      color: "text-blue-400",    bg: "bg-blue-500/15" },
  payment_success:    { icon: CreditCard,    color: "text-emerald-400", bg: "bg-emerald-500/15" },
  course_enrolled:    { icon: GraduationCap, color: "text-emerald-400", bg: "bg-emerald-500/15" },
  class_scheduled:    { icon: Video,         color: "text-amber-400",   bg: "bg-amber-500/15" },
  class_started:      { icon: Video,         color: "text-rose-400",    bg: "bg-rose-500/15" },
  doubt_replied:      { icon: MessageCircle, color: "text-violet-400",  bg: "bg-violet-500/15" },
  test_submitted:     { icon: ClipboardList, color: "text-blue-400",    bg: "bg-blue-500/15" },
  test_analytics:     { icon: BarChart2,     color: "text-cyan-400",    bg: "bg-cyan-500/15" },
  certificate_awarded:{ icon: Award,         color: "text-amber-400",   bg: "bg-amber-500/15" },
  test_created:       { icon: ClipboardList, color: "text-purple-400",  bg: "bg-purple-500/15" },
  summary_available:  { icon: FileText,      color: "text-teal-400",    bg: "bg-teal-500/15" },
  student_enrolled:   { icon: Users,         color: "text-emerald-400", bg: "bg-emerald-500/15" },
};

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
  if (seconds < 60)  return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function NotificationBell() {
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const [open,         setOpen]         = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread,       setUnread]       = useState(0);
  const [loading,      setLoading]      = useState(false);
  const panelRef  = useRef(null);
  const socketRef = useRef(null);

  // ── Fetch on mount ────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/v1/notifications", { withCredentials: true });
      setNotifications(data.notifications || []);
      setUnread(data.unreadCount || 0);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  // ── Socket: join personal room + listen for new-notification ─
  useEffect(() => {
    if (!user?._id) return;
    const socket = io(window.location.origin, { withCredentials: true });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join-user-room", user._id.toString());
    });

    socket.on("new-notification", (notif) => {
      setNotifications((prev) => [notif, ...prev].slice(0, 50));
      setUnread((c) => c + 1);
    });

    return () => { socket.disconnect(); socketRef.current = null; };
  }, [user?._id]);

  // ── Close panel on outside click ─────────────────────────
  useEffect(() => {
    const handler = (e) => { if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false); };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const markOne = async (id) => {
    await axios.patch(`/api/v1/notifications/${id}/read`, {}, { withCredentials: true }).catch(() => {});
    setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
    setUnread((c) => Math.max(0, c - 1));
  };

  const markAll = async () => {
    await axios.patch("/api/v1/notifications/read-all", {}, { withCredentials: true }).catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnread(0);
  };

  const deleteOne = async (e, id) => {
    e.stopPropagation();
    await axios.delete(`/api/v1/notifications/${id}`, { withCredentials: true }).catch(() => {});
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    setUnread((c) => {
      const wasUnread = notifications.find((n) => n._id === id && !n.isRead);
      return wasUnread ? Math.max(0, c - 1) : c;
    });
  };

  const clearAll = async () => {
    await axios.delete("/api/v1/notifications", { withCredentials: true }).catch(() => {});
    setNotifications([]);
    setUnread(0);
  };

  const handleClick = (notif) => {
    if (!notif.isRead) markOne(notif._id);
    if (notif.link) { setOpen(false); navigate(notif.link); }
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-xl hover:bg-white/8 text-white/50 hover:text-white transition-all"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center px-1 shadow-lg">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-12 z-50 w-96 bg-slate-900/98 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/6 bg-white/2 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Bell size={14} className="text-white/50" />
              <span className="text-sm font-semibold text-white">Notifications</span>
              {unread > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  {unread} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {unread > 0 && (
                <button onClick={markAll}
                  className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all">
                  <CheckCheck size={11} /> Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button onClick={clearAll}
                  className="p-1.5 rounded-lg hover:bg-rose-500/15 text-white/30 hover:text-rose-400 transition-all"
                  title="Clear all">
                  <Trash2 size={13} />
                </button>
              )}
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-white transition-all">
                <X size={14} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-white/4">
            {loading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-9 h-9 rounded-xl bg-white/5 flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-white/5 rounded w-3/4" />
                      <div className="h-2.5 bg-white/5 rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-3">
                  <Bell size={20} className="text-white/20" />
                </div>
                <p className="text-white/30 text-sm">You're all caught up!</p>
                <p className="text-white/15 text-xs mt-1">Notifications will appear here</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const meta = TYPE_META[notif.type] || { icon: Info, color: "text-white/50", bg: "bg-white/5" };
                const Icon = meta.icon;
                return (
                  <div
                    key={notif._id}
                    onClick={() => handleClick(notif)}
                    className={`flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-all group ${
                      notif.isRead ? "hover:bg-white/2" : "bg-blue-500/5 hover:bg-blue-500/8"
                    }`}
                  >
                    {/* Icon */}
                    <div className={`w-9 h-9 rounded-xl ${meta.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <Icon size={15} className={meta.color} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-medium leading-snug ${notif.isRead ? "text-white/70" : "text-white"}`}>
                          {notif.title}
                        </p>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {!notif.isRead && (
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                          )}
                          <button
                            onClick={(e) => deleteOne(e, notif._id)}
                            className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-white/20 hover:text-rose-400 transition-all"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-white/40 mt-0.5 leading-relaxed line-clamp-2">
                        {notif.message}
                      </p>
                      <p className="text-[10px] text-white/20 mt-1.5">{timeAgo(notif.createdAt)}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-white/5 bg-white/1 flex-shrink-0">
              <p className="text-xs text-white/20 text-center">{notifications.length} notification{notifications.length !== 1 ? "s" : ""} total</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}