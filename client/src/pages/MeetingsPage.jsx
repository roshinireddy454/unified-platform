import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Video, Plus, Clock, Calendar, Copy, Mic, Play,
  History, Hash, LogIn, User, BookOpen, Users,
  Film, Download, ExternalLink, ChevronRight, Radio,
  Trash2, AlertTriangle, X
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

const streamSafeId = (prefix = "meeting") =>
  `${prefix}_${crypto.randomUUID().replace(/-/g, "_")}`;

// ─── Meeting Card ─────────────────────────────────────────────
function MeetingCard({ meeting, onJoin, onDelete, currentUserId, isInstructor }) {
  const isOwner = (meeting.createdBy?._id ?? meeting.createdBy) === currentUserId;
  const colors = { scheduled: "badge-blue", live: "badge-green", ended: "badge-rose", cancelled: "badge-amber" };

  const copyId = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(meeting.meetingId);
    toast.success("Meeting ID copied!");
  };

  return (
    <div className={`card p-5 border transition-all ${
      meeting.status === "live" ? "border-emerald-500/30 bg-emerald-500/3" : "border-white/6 hover:border-white/12"
    }`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
          meeting.status === "live" ? "bg-emerald-500/15" : "bg-azure-500/15"
        }`}>
          {meeting.status === "live"
            ? <Radio size={17} className="text-emerald-400 animate-pulse" />
            : <Video size={17} className="text-azure-400" />
          }
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-medium text-white text-sm">{meeting.title}</h3>
            <span className={`${colors[meeting.status] || "badge-blue"} text-xs`}>
              {meeting.status === "live" ? "🔴 LIVE" : meeting.status}
            </span>
          </div>
          {meeting.description && (
            <p className="text-white/35 text-xs mt-0.5 truncate">{meeting.description}</p>
          )}
          <div className="flex items-center gap-4 mt-2 flex-wrap text-white/30 text-xs">
            {meeting.createdBy?.name && (
              <span className="flex items-center gap-1"><User size={10} /> {meeting.createdBy.name}</span>
            )}
            {meeting.scheduledAt && (
              <span className="flex items-center gap-1">
                <Calendar size={10} />
                {format(new Date(meeting.scheduledAt), "MMM d · h:mm a")}
                <span className="text-white/20">
                  ({formatDistanceToNow(new Date(meeting.scheduledAt), { addSuffix: true })})
                </span>
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button onClick={copyId} title="Copy meeting ID"
            className="p-2 rounded-lg text-white/20 hover:text-white/60 hover:bg-white/5 transition-all">
            <Copy size={13} />
          </button>

          {/* Delete button — instructor & owner only */}
          {isInstructor && isOwner && (
            <button
              onClick={() => onDelete(meeting.meetingId, meeting.title)}
              className="p-2 rounded-lg text-white/20 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
              title="Delete from all views"
            >
              <Trash2 size={13} />
            </button>
          )}

          <button
            onClick={() => onJoin(meeting.meetingId)}
            disabled={meeting.status === "ended"}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              meeting.status === "ended"
                ? "bg-white/5 text-white/20 cursor-not-allowed"
                : meeting.status === "live"
                ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                : isOwner
                ? "bg-azure-600 hover:bg-azure-500 text-white"
                : "bg-navy-700 hover:bg-navy-600 text-white/80 border border-white/10"
            }`}
          >
            {meeting.status === "ended" ? "Ended" :
              meeting.status === "live" ? <><Play size={11} fill="currentColor" /> Join Live</> :
              isOwner ? <><Play size={11} /> Start</> : <><LogIn size={11} /> Join</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Recordings Card ──────────────────────────────────────────
function RecordingCard({ item }) {
  const { meeting, recordings } = item;
  return (
    <div className="card p-5 border border-white/6 space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-rose-500/15 flex items-center justify-center shrink-0">
          <Film size={17} className="text-rose-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-white text-sm">{meeting.title}</h3>
          <div className="flex items-center gap-3 mt-1 text-white/30 text-xs flex-wrap">
            {meeting.createdBy?.name && <span><User size={10} className="inline mr-1" />{meeting.createdBy.name}</span>}
            {meeting.endedAt && <span><Calendar size={10} className="inline mr-1" />{format(new Date(meeting.endedAt), "MMM d, yyyy")}</span>}
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {recordings.map((r, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/5">
            <Film size={13} className="text-white/30 shrink-0" />
            <span className="flex-1 text-xs text-white/50 truncate">{r.filename || `Recording ${i + 1}`}</span>
            {r.duration && <span className="text-xs text-white/25">{Math.round(r.duration / 60)}m</span>}
            <div className="flex gap-1">
              <a href={r.url} target="_blank" rel="noopener noreferrer"
                className="p-1.5 rounded-lg text-azure-400 hover:bg-azure-500/10 transition-all" title="Watch">
                <ExternalLink size={12} />
              </a>
              <a href={r.url} download
                className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-all" title="Download">
                <Download size={12} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function MeetingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isInstructor = user?.role === "instructor";

  const [tab, setTab] = useState("upcoming");
  const [meetings, setMeetings] = useState([]);
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showModal, setShowModal] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({ title: "", description: "", scheduledAt: "" });
  const [joinId, setJoinId] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // { meetingId, title }
  const [deleting, setDeleting] = useState(false);

  const fetchMeetings = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint =
        tab === "upcoming" ? "/api/v1/meeting/upcoming" :
        tab === "previous" ? "/api/v1/meeting/previous" :
        "/api/v1/meeting";
      const { data } = await axios.get(endpoint, { withCredentials: true });
      setMeetings(data.meetings || []);
    } finally { setLoading(false); }
  }, [tab]);

  const fetchRecordings = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/v1/meeting/recordings", { withCredentials: true });
      setRecordings(data.recordings || []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (tab === "recordings") fetchRecordings();
    else fetchMeetings();
  }, [tab, fetchMeetings, fetchRecordings]);

  const goToMeeting = (id) => navigate(`/meeting/${encodeURIComponent(id)}`);

  const handleJoinById = async () => {
    const rawId = joinId.trim();
    if (!rawId) return;
    const sanitized = rawId.replace(/[^a-z0-9_-]/gi, "_").toLowerCase();
    setJoinLoading(true);
    try {
      const { data } = await axios.get(`/api/v1/meeting/${encodeURIComponent(sanitized)}`, { withCredentials: true });
      if (data.success) {
        if (data.meeting.status === "ended") { toast.error("This meeting has already ended."); return; }
        setShowModal(null); setJoinId(""); goToMeeting(sanitized);
      }
    } catch {
      toast("Joining room… if the teacher hasn't started, wait for them.", { icon: "ℹ️" });
      setShowModal(null); setJoinId(""); goToMeeting(sanitized);
    } finally { setJoinLoading(false); }
  };

  const createMeeting = async (type) => {
    setCreating(true);
    try {
      let meetingId, payload;
      if (type === "instant") {
        meetingId = streamSafeId("instant");
        payload = { meetingId, title: "Instant Class", status: "live" };
      } else if (type === "personal") {
        meetingId = `personal_${user._id.toString()}`;
        payload = { meetingId, title: `${user.name}'s Room`, isPersonalRoom: true };
      } else {
        meetingId = streamSafeId("class");
        payload = { meetingId, title: scheduleForm.title || "Scheduled Class", description: scheduleForm.description, scheduledAt: scheduleForm.scheduledAt || undefined };
      }
      await axios.post("/api/v1/meeting", payload, { withCredentials: true });
      if (type !== "schedule") {
        goToMeeting(meetingId);
      } else {
        toast.success("Class scheduled!");
        setShowModal(null);
        setScheduleForm({ title: "", description: "", scheduledAt: "" });
        fetchMeetings();
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to create meeting");
    } finally { setCreating(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axios.delete(`/api/v1/meeting/${encodeURIComponent(deleteTarget.meetingId)}`, { withCredentials: true });
      toast.success("Meeting deleted — removed from all views. Summary & attendance preserved.");
      setMeetings((prev) => prev.filter((m) => m.meetingId !== deleteTarget.meetingId));
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete meeting");
    } finally { setDeleting(false); }
  };

  const tabs = [
    { id: "upcoming", label: "Upcoming", icon: Clock },
    { id: "all", label: isInstructor ? "My Classes" : "All Classes", icon: Video },
    { id: "previous", label: "Previous", icon: History },
    { id: "recordings", label: "Recordings", icon: Film },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="section-title">{isInstructor ? "Live Classes" : "Join a Class"}</h1>
          <p className="text-white/35 text-sm mt-1">
            {isInstructor ? "Host and schedule live video classes" : "View and join live classes from your instructors"}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowModal("joinById")} className="btn-secondary text-sm flex items-center gap-2">
            <Hash size={14} /> Join by ID
          </button>
          {isInstructor ? (
            <button onClick={() => setShowModal("create")} className="btn-primary text-sm flex items-center gap-2">
              <Plus size={14} /> New Class
            </button>
          ) : (
            <button onClick={() => setShowModal("join")} className="btn-primary text-sm flex items-center gap-2">
              <LogIn size={14} /> Join a Class
            </button>
          )}
        </div>
      </div>

      {/* Instructor quick actions */}
      {isInstructor && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Start Instant Class", desc: "Go live right now", icon: Play, color: "azure", action: () => createMeeting("instant") },
            { label: "Schedule a Class", desc: "Pick date & time", icon: Calendar, color: "emerald", action: () => setShowModal("schedule") },
            { label: "Personal Room", desc: "Your permanent link", icon: Mic, color: "amber", action: () => createMeeting("personal") },
          ].map(({ label, desc, icon: Icon, color, action }) => (
            <button key={label} onClick={action} disabled={creating}
              className="card-hover p-5 text-left flex items-center gap-4 disabled:opacity-50 disabled:pointer-events-none">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                color === "azure" ? "bg-azure-500/15 text-azure-400" :
                color === "emerald" ? "bg-emerald-500/15 text-emerald-400" :
                "bg-amber-500/15 text-amber-400"
              }`}>
                <Icon size={20} />
              </div>
              <div>
                <div className="font-medium text-white text-sm">{label}</div>
                <div className="text-xs text-white/35 mt-0.5">{desc}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Student info banner */}
      {!isInstructor && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-azure-500/8 border border-azure-500/20">
          <BookOpen size={17} className="text-azure-400 mt-0.5 shrink-0" />
          <p className="text-white/55 text-sm leading-relaxed">
            Live and scheduled classes appear here automatically. Use <strong className="text-white">Join by ID</strong> if your instructor shared a meeting ID directly.
          </p>
        </div>
      )}

      {/* Delete tip for instructor */}
      {isInstructor && (
        <div className="flex items-start gap-3 p-3 rounded-xl bg-white/3 border border-white/5">
          <Trash2 size={14} className="text-white/25 mt-0.5 shrink-0" />
          <p className="text-white/30 text-xs leading-relaxed">
            Click the <strong className="text-white/50">trash icon</strong> on any class to remove it from all views. Summary and attendance records are preserved.
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-navy-900/60 rounded-xl p-1 border border-white/5 overflow-x-auto w-fit max-w-full">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              tab === id ? "bg-azure-600 text-white" : "text-white/40 hover:text-white/70"
            }`}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid gap-3">{[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-2xl shimmer" />)}</div>
      ) : tab === "recordings" ? (
        recordings.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-16 text-center">
            <Film size={40} className="text-white/10 mb-4" />
            <p className="text-white/30 font-medium">No recordings yet</p>
          </div>
        ) : (
          <div className="grid gap-4">{recordings.map((item, i) => <RecordingCard key={i} item={item} />)}</div>
        )
      ) : meetings.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <Video size={40} className="text-white/10 mb-4" />
          <p className="text-white/30 font-medium">No classes found</p>
          <p className="text-white/20 text-sm mt-1">
            {tab === "upcoming" ? (isInstructor ? "Schedule a class to get started" : "No upcoming classes yet") :
             tab === "previous" ? "Ended classes appear here" : "Classes appear here"}
          </p>
          {isInstructor && tab !== "previous" && (
            <button onClick={() => setShowModal("schedule")} className="btn-primary text-sm mt-4 flex items-center gap-1">
              <Plus size={13} /> Schedule a Class
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-3">
          {meetings.map((m) => (
            <MeetingCard key={m._id} meeting={m}
              onJoin={goToMeeting}
              onDelete={(meetingId, title) => setDeleteTarget({ meetingId, title })}
              currentUserId={user?._id}
              isInstructor={isInstructor}
            />
          ))}
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-sm p-6 text-center animate-slide-up">
            <div className="w-14 h-14 rounded-full bg-rose-500/15 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={24} className="text-rose-400" />
            </div>
            <h3 className="font-display text-lg font-semibold text-white mb-2">Delete Class?</h3>
            <p className="text-white/50 text-sm mb-1">
              "<strong className="text-white">{deleteTarget.title}</strong>" will be removed from your view and all students.
            </p>
            <p className="text-emerald-400/70 text-xs mb-6 flex items-center justify-center gap-1">
              ✓ Summary and attendance records are preserved
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 btn-secondary text-sm" disabled={deleting}>
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                {deleting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Trash2 size={14} /> Delete</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create / Join Modals ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md p-6 animate-slide-up">

            {showModal === "create" && (
              <>
                <h3 className="font-display text-lg font-semibold text-white mb-4">New Class</h3>
                <div className="space-y-2">
                  {[
                    { label: "Start Instant Class", desc: "Go live right now", icon: Play, action: () => { setShowModal(null); createMeeting("instant"); } },
                    { label: "Schedule a Class", desc: "Set date & time", icon: Calendar, action: () => setShowModal("schedule") },
                    { label: "Open Personal Room", desc: "Your permanent link", icon: Mic, action: () => { setShowModal(null); createMeeting("personal"); } },
                  ].map(({ label, desc, icon: Icon, action }) => (
                    <button key={label} onClick={action}
                      className="w-full flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/8 border border-white/6 hover:border-white/12 text-left transition-all">
                      <Icon size={15} className="text-azure-400 shrink-0" />
                      <div><div className="text-sm text-white font-medium">{label}</div><div className="text-xs text-white/35">{desc}</div></div>
                      <ChevronRight size={14} className="text-white/20 ml-auto shrink-0" />
                    </button>
                  ))}
                </div>
                <button onClick={() => setShowModal(null)} className="btn-secondary w-full mt-3 text-sm">Cancel</button>
              </>
            )}

            {showModal === "schedule" && (
              <>
                <h3 className="font-display text-lg font-semibold text-white mb-4">Schedule a Class</h3>
                <div className="space-y-3">
                  <div>
                    <label className="label">Class Title *</label>
                    <input className="input" placeholder="e.g. Introduction to React Hooks"
                      value={scheduleForm.title} onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Description (optional)</label>
                    <textarea className="input resize-none" rows={2} placeholder="What will you cover?"
                      value={scheduleForm.description} onChange={(e) => setScheduleForm({ ...scheduleForm, description: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Date & Time *</label>
                    <input className="input" type="datetime-local" value={scheduleForm.scheduledAt}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledAt: e.target.value })} />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/30 bg-white/3 rounded-lg p-3">
                    <Users size={11} className="shrink-0" />
                    Students will see this in their Upcoming tab automatically.
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => setShowModal(isInstructor ? "create" : null)} className="btn-secondary flex-1 text-sm">Back</button>
                  <button onClick={() => createMeeting("schedule")}
                    disabled={creating || !scheduleForm.title.trim() || !scheduleForm.scheduledAt}
                    className="btn-primary flex-1 text-sm disabled:opacity-50 disabled:pointer-events-none">
                    {creating ? "Scheduling…" : "Schedule Class"}
                  </button>
                </div>
              </>
            )}

            {showModal === "join" && (
              <>
                <h3 className="font-display text-lg font-semibold text-white mb-1">Join a Class</h3>
                <p className="text-white/35 text-xs mb-4">Browse live and upcoming classes</p>
                <button onClick={() => { setShowModal(null); setTab("all"); }}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/8 border border-white/6 transition-all">
                  <div className="flex items-center gap-3">
                    <Video size={16} className="text-azure-400" />
                    <div className="text-left">
                      <div className="text-sm text-white font-medium">Browse All Classes</div>
                      <div className="text-xs text-white/35">See all scheduled and live sessions</div>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-white/30" />
                </button>
                <button onClick={() => setShowModal(null)} className="btn-secondary w-full mt-3 text-sm">Cancel</button>
              </>
            )}

            {showModal === "joinById" && (
              <>
                <h3 className="font-display text-lg font-semibold text-white mb-1">Join by Meeting ID</h3>
                <p className="text-white/35 text-xs mb-4">Paste the meeting ID shared by your instructor</p>
                <input className="input" placeholder="e.g. instant_abc123_def456"
                  value={joinId} onChange={(e) => setJoinId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && joinId.trim() && handleJoinById()}
                  autoFocus />
                <p className="text-white/20 text-xs mt-2">Copy the ID using the copy icon on any meeting card.</p>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => setShowModal(null)} className="btn-secondary flex-1 text-sm">Cancel</button>
                  <button onClick={handleJoinById} disabled={!joinId.trim() || joinLoading}
                    className="btn-primary flex-1 text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                    {joinLoading
                      ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <><LogIn size={14} /> Join Now</>
                    }
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}