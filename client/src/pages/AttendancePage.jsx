import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Users, Clock, Calendar, Timer, Search, Filter } from "lucide-react";
import { format, formatDistanceStrict } from "date-fns";

export default function AttendancePage() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [meetingAttendance, setMeetingAttendance] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [selectedMeeting, setSelectedMeeting] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [myRes, meetingsRes] = await Promise.allSettled([
          axios.get("/api/v1/meeting/attendance/my", { withCredentials: true }),
          axios.get("/api/v1/meeting", { withCredentials: true }),
        ]);
        if (myRes.status === "fulfilled") setAttendance(myRes.value.data.attendance || []);
        if (meetingsRes.status === "fulfilled") setMeetings(meetingsRes.value.data.meetings || []);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const fetchMeetingAttendance = async (meetingId) => {
    setSelectedMeeting(meetingId);
    if (!meetingId) { setMeetingAttendance([]); return; }
    try {
      const { data } = await axios.get(`/api/v1/meeting/${encodeURIComponent(meetingId)}/attendance`, { withCredentials: true });
      setMeetingAttendance(data.attendance || []);
    } catch (e) {
      console.error(e);
    }
  };

  const totalDuration = attendance.reduce((acc, a) => acc + (a.durationMinutes || 0), 0);
  const filtered = attendance.filter((a) => a.meetingId?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title">Attendance</h1>
        <p className="text-white/35 text-sm mt-1">Track your meeting participation history</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Sessions", value: attendance.length, icon: Calendar, color: "azure" },
          { label: "Total Duration", value: `${totalDuration}m`, icon: Timer, color: "emerald" },
          { label: "Avg Duration", value: attendance.length ? `${Math.round(totalDuration / attendance.length)}m` : "—", icon: Clock, color: "amber" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="stat-card">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              color === "azure" ? "bg-azure-500/15 text-azure-400"
              : color === "emerald" ? "bg-emerald-500/15 text-emerald-400"
              : "bg-amber-500/15 text-amber-400"
            }`}><Icon size={16} /></div>
            <div>
              <div className="text-xl font-semibold font-display text-white">{value}</div>
              <div className="text-xs text-white/35">{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* My Attendance */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-white">My Attendance History</h2>
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                className="input pl-8 py-1.5 text-sm w-48"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-14 rounded-xl shimmer" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center">
              <Users size={32} className="text-white/10 mb-3" />
              <p className="text-white/30 text-sm">No attendance records yet</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filtered.map((a) => (
                <div key={a._id} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/5">
                  <div className="w-8 h-8 rounded-lg bg-azure-500/15 flex items-center justify-center flex-shrink-0">
                    <Clock size={14} className="text-azure-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-mono text-white/50 truncate">{a.meetingId}</div>
                    <div className="text-xs text-white/30 mt-0.5">
                      {a.joinTime ? format(new Date(a.joinTime), "MMM d, h:mm a") : "—"}
                    </div>
                  </div>
                  <div className="text-right">
                    {a.durationMinutes
                      ? <span className="badge-green text-xs">{a.durationMinutes}m</span>
                      : a.leaveTime === null
                      ? <span className="badge-amber text-xs">Active</span>
                      : <span className="badge text-xs bg-white/5 text-white/30">—</span>
                    }
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Meeting Attendance (instructor view) */}
        {user?.role === "instructor" && (
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-medium text-white">Meeting Participants</h2>
              <Filter size={14} className="text-white/30" />
            </div>
            <div className="mb-3">
              <label className="label">Select Meeting</label>
              <select className="input" value={selectedMeeting} onChange={e => fetchMeetingAttendance(e.target.value)}>
                <option value="">Choose a meeting...</option>
                {meetings.map(m => (
                  <option key={m._id} value={m.meetingId}>{m.title} - {m.meetingId.slice(-8)}</option>
                ))}
              </select>
            </div>

            {meetingAttendance.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center">
                <Users size={32} className="text-white/10 mb-3" />
                <p className="text-white/30 text-sm">{selectedMeeting ? "No participants recorded" : "Select a meeting to view"}</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {meetingAttendance.map((a) => (
                  <div key={a._id} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-azure-500 to-emerald-500 flex items-center justify-center text-xs font-semibold overflow-hidden flex-shrink-0">
                      {a.userId?.photoUrl
                        ? <img src={a.userId.photoUrl} alt="" className="w-full h-full object-cover" />
                        : a.userId?.name?.[0]?.toUpperCase()
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">{a.userId?.name || "Unknown"}</div>
                      <div className="text-xs text-white/30">{a.userId?.email}</div>
                    </div>
                    <div className="text-right flex flex-col gap-1">
                      {a.durationMinutes
                        ? <span className="badge-green text-xs">{a.durationMinutes}m</span>
                        : <span className="badge-amber text-xs">Active</span>
                      }
                      <span className="text-xs text-white/20">
                        {a.joinTime ? format(new Date(a.joinTime), "h:mm a") : "—"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
