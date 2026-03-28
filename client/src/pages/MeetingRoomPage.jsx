import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { io } from "socket.io-client";
import {
  StreamVideo, StreamVideoClient, StreamCall,
  CallControls, SpeakerLayout, StreamTheme,
  useCallStateHooks, CallingState,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import toast from "react-hot-toast";
import {
  GraduationCap, FileText, Users, Loader, Subtitles, X,
  Mic, MicOff, Clock, UserCheck, UserX, Bell, AlertTriangle,
  PenLine, MessageSquare, BarChart2, LayoutGrid, Maximize2,
  Monitor, EyeOff, User, Minimize2,
} from "lucide-react";
import LiveWhiteboard from "../components/LiveWhiteBoard";
import LiveChatPanel from "../components/LiveChatPanel";
import LivePollPanel from "../components/LivePollPanel";
import BreakoutRoomPanel from "../components/BreakoutRoomPanel";

// ─────────────────────────────────────────────────────────────
// Layout Mode Options
// ─────────────────────────────────────────────────────────────
const LAYOUT_MODES = [
  { id: "default",          label: "Default",             icon: LayoutGrid,  desc: "Speaker + participants bar" },
  { id: "teacher-only",     label: "Teacher Only",        icon: Monitor,     desc: "Only instructor video" },
  { id: "students-only",    label: "Students Only",       icon: Users,       desc: "Only students' videos" },
  { id: "no-participants",  label: "No Participants",     icon: EyeOff,      desc: "Hide participant bar" },
];

function LayoutSelector({ current, onChange, onClose }) {
  return (
    <div className="absolute right-4 top-16 z-30 w-72 bg-navy-900/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/8 bg-white/3">
        <span className="text-sm font-semibold text-white">View Layout</span>
        <button onClick={onClose} className="text-white/30 hover:text-white p-1"><X size={15} /></button>
      </div>
      <div className="p-2 space-y-1">
        {LAYOUT_MODES.map(({ id, label, icon: Icon, desc }) => (
          <button
            key={id}
            onClick={() => { onChange(id); onClose(); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
              current === id ? "bg-azure-600/80 text-white" : "text-white/70 hover:bg-white/8 hover:text-white"
            }`}
          >
            <Icon size={16} className="flex-shrink-0" />
            <div>
              <div className="text-sm font-medium">{label}</div>
              <div className="text-xs text-white/40">{desc}</div>
            </div>
            {current === id && <div className="ml-auto w-2 h-2 rounded-full bg-azure-400" />}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Waiting Room Panel
// ─────────────────────────────────────────────────────────────
function WaitingRoomPanel({ meetingId, onClose }) {
  const [waitingList, setWaitingList] = useState([]);
  const [admitting, setAdmitting] = useState(null);

  const fetchWaiting = useCallback(async () => {
    try {
      const { data } = await axios.get(`/api/v1/meeting/${meetingId}/waiting-room`, { withCredentials: true });
      setWaitingList(data.waitingRoom || []);
    } catch {}
  }, [meetingId]);

  useEffect(() => {
    fetchWaiting();
    const t = setInterval(fetchWaiting, 4000);
    return () => clearInterval(t);
  }, [fetchWaiting]);

  const admit = async (userId) => {
    setAdmitting(userId);
    try {
      await axios.post(`/api/v1/meeting/${meetingId}/admit/${userId}`, {}, { withCredentials: true });
      setWaitingList((p) => p.filter((s) => {
        const id = s.userId?._id?.toString() || s.userId?.toString();
        return id !== userId;
      }));
      toast.success("Student admitted!");
    } catch { toast.error("Failed to admit"); }
    finally { setAdmitting(null); }
  };

  const reject = async (userId) => {
    try {
      await axios.post(`/api/v1/meeting/${meetingId}/reject/${userId}`, {}, { withCredentials: true });
      setWaitingList((p) => p.filter((s) => {
        const id = s.userId?._id?.toString() || s.userId?.toString();
        return id !== userId;
      }));
      toast("Student removed from waiting room", { icon: "🚫" });
    } catch { toast.error("Failed to reject"); }
  };

  const admitAll = async () => {
    try {
      await axios.post(`/api/v1/meeting/${meetingId}/admit-all`, {}, { withCredentials: true });
      toast.success(`Admitted all ${waitingList.length} students!`);
      setWaitingList([]);
    } catch { toast.error("Failed to admit all"); }
  };

  return (
    <div className="absolute right-4 top-16 z-30 w-80 bg-navy-900/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/8 bg-white/3">
        <div className="flex items-center gap-2">
          <Users size={14} className="text-azure-400" />
          <span className="text-sm font-semibold text-white">Waiting Room</span>
          {waitingList.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-xs flex items-center justify-center font-bold">
              {waitingList.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {waitingList.length > 1 && (
            <button onClick={admitAll}
              className="text-xs bg-emerald-600/80 hover:bg-emerald-500 text-white px-2.5 py-1 rounded-lg transition-all">
              Admit All
            </button>
          )}
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors p-1">
            <X size={15} />
          </button>
        </div>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {waitingList.length === 0 ? (
          <div className="py-8 text-center">
            <Users size={24} className="text-white/15 mx-auto mb-2" />
            <p className="text-white/30 text-xs">No students waiting</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {waitingList.map((student) => {
              const id = student.userId?._id?.toString() || student.userId?.toString();
              const name = student.userId?.name || student.name || "Student";
              const photo = student.userId?.photoUrl || student.photoUrl;
              const waitMins = student.joinedAt
                ? Math.round((Date.now() - new Date(student.joinedAt)) / 60000)
                : 0;
              return (
                <div key={id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/3 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-azure-500/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {photo
                      ? <img src={photo} alt={name} className="w-full h-full object-cover" />
                      : <span className="text-sm font-semibold text-azure-300">{name[0]?.toUpperCase()}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{name}</p>
                    <p className="text-xs text-white/30 flex items-center gap-1">
                      <Clock size={9} />
                      {waitMins > 0 ? `${waitMins} min` : "Just arrived"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => admit(id)}
                      disabled={admitting === id}
                      className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-2.5 py-1.5 rounded-lg transition-all disabled:opacity-60"
                    >
                      {admitting === id
                        ? <Loader size={11} className="animate-spin" />
                        : <><UserCheck size={11} /> Admit</>}
                    </button>
                    <button
                      onClick={() => reject(id)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-white/40 hover:text-rose-400 transition-all"
                    >
                      <UserX size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Participants Panel
// ─────────────────────────────────────────────────────────────
function ParticipantsPanel({ meetingId, onClose }) {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get(`/api/v1/meeting/${meetingId}/attendance`, { withCredentials: true });
        setAttendance((data.attendance || []).filter((a) => !a.leaveTime));
      } catch {} finally { setLoading(false); }
    };
    load();
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
  }, [meetingId]);

  return (
    <div className="absolute right-4 top-16 z-30 w-72 bg-navy-900/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/8 bg-white/3">
        <div className="flex items-center gap-2">
          <Users size={14} className="text-azure-400" />
          <span className="text-sm font-semibold text-white">Participants</span>
          <span className="text-xs px-1.5 py-0.5 rounded-full bg-azure-500/20 text-azure-400 border border-azure-500/30">
            {attendance.length}
          </span>
        </div>
        <button onClick={onClose} className="text-white/30 hover:text-white transition-colors p-1">
          <X size={15} />
        </button>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="p-4 space-y-2 animate-pulse">
            {[1,2,3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5" />
                <div className="h-3 bg-white/5 rounded w-32" />
              </div>
            ))}
          </div>
        ) : attendance.length === 0 ? (
          <div className="py-8 text-center">
            <Users size={24} className="text-white/15 mx-auto mb-2" />
            <p className="text-white/30 text-xs">No participants yet</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {attendance.map((a) => {
              const u = a.userId;
              const name = u?.name || "Unknown";
              const photo = u?.photoUrl;
              const role = u?.role || "student";
              return (
                <div key={a._id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/3 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-azure-500/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {photo
                      ? <img src={photo} alt={name} className="w-full h-full object-cover" />
                      : <span className="text-xs font-semibold text-azure-300">{name[0]?.toUpperCase()}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{name}</p>
                    <p className="text-[10px] text-white/30 capitalize">{role}</p>
                  </div>
                  {role === "instructor" && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-semibold uppercase flex-shrink-0">
                      Host
                    </span>
                  )}
                  <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MeetingRoom inner component
// ─────────────────────────────────────────────────────────────
function MeetingRoom({
  meetingId, isInstructor, onLeave, onGenerateSummary,
  summaryLoading, socket, onTranscriptUpdate, user,
  breakoutInfo, setBreakoutInfo,
}) {
  const { useCallCallingState, useParticipantCount } = useCallStateHooks();
  const callingState    = useCallCallingState();
  const participantCount = useParticipantCount();

  const [transcript,       setTranscript]       = useState([]);
  const [showSubtitles,    setShowSubtitles]    = useState(false);
  const [isRecording,      setIsRecording]      = useState(false);
  const [showWaitingPanel, setShowWaitingPanel] = useState(false);
  const [showWhiteboard,   setShowWhiteboard]   = useState(false);
  const [showChat,         setShowChat]         = useState(false);
  const [showPoll,         setShowPoll]         = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showBreakout,     setShowBreakout]     = useState(false);
  const [showLayout,       setShowLayout]       = useState(false);
  const [layoutMode,       setLayoutMode]       = useState("default");
  const [waitingCount,     setWaitingCount]     = useState(0);
  const [isFullscreen,     setIsFullscreen]     = useState(false);
  const recognitionRef = useRef(null);
  const containerRef   = useRef(null);

  const closeAllPanels = () => {
    setShowWaitingPanel(false);
    setShowChat(false);
    setShowPoll(false);
    setShowParticipants(false);
    setShowBreakout(false);
    setShowLayout(false);
  };

  const togglePanel = (panel) => {
    const cur = {
      waiting: showWaitingPanel,
      chat: showChat,
      poll: showPoll,
      participants: showParticipants,
      breakout: showBreakout,
      layout: showLayout,
    }[panel];
    closeAllPanels();
    if (!cur) {
      if (panel === "waiting")      setShowWaitingPanel(true);
      else if (panel === "chat")    setShowChat(true);
      else if (panel === "poll")    setShowPoll(true);
      else if (panel === "participants") setShowParticipants(true);
      else if (panel === "breakout") setShowBreakout(true);
      else if (panel === "layout")  setShowLayout(true);
    }
  };

  // Fullscreen handling
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // ── Knock / waiting-room listeners (instructor) ────────────
  useEffect(() => {
    if (!socket || !isInstructor) return;
    const handleKnock = ({ name, userId }) => {
      setWaitingCount((c) => c + 1);
      // Auto-show waiting panel when someone knocks
      setShowWaitingPanel(true);
      toast(
        (t) => (
          <div className="flex items-center gap-3">
            <Bell size={16} className="text-amber-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-white">{name} wants to join</p>
              <p className="text-xs text-white/50 mt-0.5">Waiting Room is now open</p>
            </div>
          </div>
        ),
        { duration: 6000, style: { background: "rgb(15,23,42)", border: "1px solid rgba(255,255,255,0.1)" } }
      );
    };
    const handleUpdate = () => {
      axios.get(`/api/v1/meeting/${meetingId}/waiting-room`, { withCredentials: true })
        .then(({ data }) => setWaitingCount(data.waitingRoom?.length || 0))
        .catch(() => {});
    };
    socket.on("student-knocked", handleKnock);
    socket.on("waiting-room-update", handleUpdate);
    return () => {
      socket.off("student-knocked", handleKnock);
      socket.off("waiting-room-update", handleUpdate);
    };
  }, [socket, isInstructor, meetingId]);

  // ── REAL-TIME: Whiteboard auto-open/close for students ─────
  useEffect(() => {
    if (!socket || isInstructor) return;

    const onWbOpen = () => {
      setShowWhiteboard(true);
      toast("🖊️ Instructor opened the whiteboard!", { duration: 3000 });
    };
    const onWbClose = () => {
      setShowWhiteboard(false);
    };

    socket.on("wb-open", onWbOpen);
    socket.on("wb-close", onWbClose);
    return () => {
      socket.off("wb-open", onWbOpen);
      socket.off("wb-close", onWbClose);
    };
  }, [socket, isInstructor]);

  const handleToggleWhiteboard = () => {
    const next = !showWhiteboard;
    setShowWhiteboard(next);
    if (isInstructor && socket) {
      // Emit to the meeting-room (students) so they get notified
      socket.emit(next ? "wb-open" : "wb-close", { meetingId });
    }
  };

  // ── REAL-TIME: Breakout room events (students) ──────────────
  useEffect(() => {
    if (!socket || isInstructor) return;

    const onAssigned = ({ roomIndex, roomName, streamCallId }) => {
      setBreakoutInfo({ roomIndex, roomName, streamCallId, status: "assigned" });
      toast(`📋 You've been assigned to "${roomName}"`, { duration: 5000 });
    };
    const onStarted = ({ roomIndex, roomName, streamCallId, endsAt, durationMinutes }) => {
      setBreakoutInfo({ roomIndex, roomName, streamCallId, endsAt, durationMinutes, status: "active" });
      toast.success(`🚀 Breakout rooms started! Join "${roomName}"`, { duration: 8000 });
    };
    const onMoved = ({ roomIndex, roomName, streamCallId }) => {
      setBreakoutInfo((prev) => ({ ...prev, roomIndex, roomName, streamCallId }));
      toast(`↩️ Moved to "${roomName}"`, { duration: 4000 });
    };
    const onClosed = () => {
      setBreakoutInfo(null);
      toast("✅ Breakout rooms closed. Welcome back!", { duration: 4000 });
    };
    const onBroadcast = ({ message, from }) => {
      toast(`📢 ${from}: ${message}`, { duration: 6000 });
    };

    socket.on("breakout-assigned", onAssigned);
    socket.on("breakout-started",  onStarted);
    socket.on("breakout-moved",    onMoved);
    socket.on("breakout-closed",   onClosed);
    socket.on("breakout-broadcast",onBroadcast);

    return () => {
      socket.off("breakout-assigned", onAssigned);
      socket.off("breakout-started",  onStarted);
      socket.off("breakout-moved",    onMoved);
      socket.off("breakout-closed",   onClosed);
      socket.off("breakout-broadcast",onBroadcast);
    };
  }, [socket, isInstructor, setBreakoutInfo]);

  // ── Transcription ──────────────────────────────────────────
  const startTranscription = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR || recognitionRef.current) return;
    const r = new SR();
    r.continuous = true;
    r.interimResults = true;
    r.lang = "en-US";
    r.onresult = (e) => {
      const finals = Array.from(e.results).filter((x) => x.isFinal).map((x) => x[0].transcript.trim()).filter(Boolean);
      if (finals.length) {
        setTranscript((prev) => {
          const updated = [...prev, ...finals];
          onTranscriptUpdate?.(updated);
          return updated;
        });
      }
    };
    r.onend = () => { if (recognitionRef.current) { try { r.start(); } catch {} } };
    r.onerror = () => {};
    r.start();
    recognitionRef.current = r;
    setIsRecording(true);
  };

  const stopTranscription = () => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
  };

  useEffect(() => {
    if (callingState === CallingState.JOINED) startTranscription();
    return () => stopTranscription();
  }, [callingState]); // eslint-disable-line

  useEffect(() => {
    if (!isInstructor) return;
    axios.get(`/api/v1/meeting/${meetingId}/waiting-room`, { withCredentials: true })
      .then(({ data }) => setWaitingCount(data.waitingRoom?.length || 0))
      .catch(() => {});
  }, [isInstructor, meetingId]);

  if (callingState !== CallingState.JOINED) {
    return (
      <div className="flex items-center justify-center h-screen bg-navy-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-2 border-azure-500/30 border-t-azure-500 rounded-full animate-spin" />
          <p className="text-white/50 text-sm">Connecting to class…</p>
        </div>
      </div>
    );
  }

  const BreakoutBanner = () => {
    if (!breakoutInfo || isInstructor) return null;
    return (
      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 w-80">
        <div className={`flex items-center gap-3 p-3 rounded-xl border shadow-xl backdrop-blur-md ${
          breakoutInfo.status === "active"
            ? "bg-emerald-500/15 border-emerald-500/30"
            : "bg-amber-500/10 border-amber-500/20"
        }`}>
          <LayoutGrid size={16} className={breakoutInfo.status === "active" ? "text-emerald-400" : "text-amber-400"} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white">{breakoutInfo.roomName}</p>
            <p className="text-xs text-white/50">
              {breakoutInfo.status === "active" ? "Breakout room is active" : "Assigned — waiting to start"}
            </p>
          </div>
          {breakoutInfo.status === "active" && (
            <button
              onClick={() => {
                socket?.emit("join-breakout-room", { meetingId, streamCallId: breakoutInfo.streamCallId });
                setShowBreakout(true);
              }}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex-shrink-0"
            >
              Join Room
            </button>
          )}
        </div>
      </div>
    );
  };

  // Determine speaker layout based on mode
  const getSpeakerLayoutProps = () => {
    switch (layoutMode) {
      case "teacher-only":
        return { participantsBarPosition: "hidden" };
      case "students-only":
        return { participantsBarPosition: "top" };
      case "no-participants":
        return { participantsBarPosition: "hidden" };
      default:
        return { participantsBarPosition: "bottom" };
    }
  };

  return (
    <StreamTheme>
      <div ref={containerRef} className="relative h-screen bg-navy-950 flex flex-col overflow-hidden">

        {/* ── Top bar ─────────────────────────────────────── */}
        <div className="live-room-topbar absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-5 py-3 bg-gradient-to-b from-black/70 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
              <GraduationCap size={15} className="text-white" />
            </div>
            <div>
              <span className="font-display text-sm font-bold text-white">
                Collab<span className="text-cyan-400">Sphere</span>
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-emerald-400">Live</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* Participant count */}
            <button
              onClick={() => togglePanel("participants")}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
                showParticipants
                  ? "bg-azure-600/80 border-azure-500/50 text-white"
                  : "bg-navy-800/70 border-white/10 text-white/60 hover:text-white"
              }`}
            >
              <Users size={11} /> {participantCount} in class
            </button>

            {/* Waiting Room (instructor only) */}
            {isInstructor && (
              <button
                onClick={() => togglePanel("waiting")}
                className={`relative flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
                  showWaitingPanel
                    ? "bg-amber-600/80 border-amber-500/50 text-white"
                    : "bg-navy-800/70 border-white/10 text-white/60 hover:text-white"
                }`}
              >
                <Users size={11} /> Waiting Room
                {waitingCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-xs flex items-center justify-center font-bold animate-pulse">
                    {waitingCount}
                  </span>
                )}
              </button>
            )}

            {/* Chat */}
            <button
              onClick={() => togglePanel("chat")}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
                showChat
                  ? "bg-emerald-600/80 border-emerald-500/50 text-white"
                  : "bg-navy-800/70 border-white/10 text-white/60 hover:text-white"
              }`}
            >
              <MessageSquare size={11} /> Chat
            </button>

            {/* Poll */}
            <button
              onClick={() => togglePanel("poll")}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
                showPoll
                  ? "bg-violet-600/80 border-violet-500/50 text-white"
                  : "bg-navy-800/70 border-white/10 text-white/60 hover:text-white"
              }`}
            >
              <BarChart2 size={11} /> Poll
            </button>

            {/* Breakout Rooms */}
            <button
              onClick={() => togglePanel("breakout")}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
                showBreakout
                  ? "bg-teal-600/80 border-teal-500/50 text-white"
                  : "bg-navy-800/70 border-white/10 text-white/60 hover:text-white"
              }`}
            >
              <LayoutGrid size={11} /> Breakout
            </button>

            {/* Whiteboard */}
            <button
              onClick={handleToggleWhiteboard}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
                showWhiteboard
                  ? "bg-violet-600/80 border-violet-500/50 text-white"
                  : "bg-navy-800/70 border-white/10 text-white/60 hover:text-white"
              }`}
            >
              <PenLine size={11} /> Whiteboard
            </button>

            {/* Subtitles */}
            <button
              onClick={() => setShowSubtitles((s) => !s)}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
                showSubtitles
                  ? "bg-azure-600/80 border-azure-500/50 text-white"
                  : "bg-navy-800/70 border-white/10 text-white/60 hover:text-white"
              }`}
            >
              <Subtitles size={11} /> Captions
            </button>

            {/* Record */}
            <button
              onClick={isRecording ? stopTranscription : startTranscription}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
                isRecording
                  ? "bg-rose-600/70 border-rose-500/50 text-white"
                  : "bg-navy-800/70 border-white/10 text-white/60 hover:text-white"
              }`}
            >
              {isRecording
                ? <><Mic size={11} className="animate-pulse" /> Recording</>
                : <><MicOff size={11} /> Record</>}
            </button>

            {/* Layout selector — available to ALL users */}
            <button
              onClick={() => togglePanel("layout")}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
                showLayout
                  ? "bg-sky-600/80 border-sky-500/50 text-white"
                  : "bg-navy-800/70 border-white/10 text-white/60 hover:text-white"
              }`}
            >
              <Monitor size={11} /> Layout
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border bg-navy-800/70 border-white/10 text-white/60 hover:text-white transition-all"
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 size={11} /> : <Maximize2 size={11} />}
            </button>

            {/* AI Summary (instructor) */}
            {isInstructor && (
              <button
                onClick={() => onGenerateSummary(transcript.join(". ") || "No transcript captured.")}
                disabled={summaryLoading}
                className="flex items-center gap-2 bg-emerald-700/70 hover:bg-emerald-600/80 text-white border border-emerald-500/30 text-xs px-3 py-1.5 rounded-lg transition-all disabled:opacity-60"
              >
                {summaryLoading ? <Loader size={11} className="animate-spin" /> : <FileText size={11} />}
                AI Summary
              </button>
            )}
          </div>
        </div>

        {/* ── Video layout ─────────────────────────────────── */}
        <div className="flex-1 pt-14 pb-20">
          {layoutMode === "teacher-only" ? (
            <div className="w-full h-full flex items-center justify-center">
              <SpeakerLayout participantsBarPosition="hidden" />
            </div>
          ) : layoutMode === "no-participants" ? (
            <SpeakerLayout participantsBarPosition="hidden" />
          ) : (
            <SpeakerLayout participantsBarPosition="bottom" />
          )}
        </div>

        {/* ── Breakout banner (student assigned) ──────────── */}
        <BreakoutBanner />

        {/* ── Panels ──────────────────────────────────────── */}
        {isInstructor && showWaitingPanel && (
          <WaitingRoomPanel meetingId={meetingId} onClose={() => setShowWaitingPanel(false)} />
        )}
        {showParticipants && (
          <ParticipantsPanel meetingId={meetingId} onClose={() => setShowParticipants(false)} />
        )}
        {showChat && (
          <LiveChatPanel
            meetingId={meetingId} user={user} socket={socket}
            isInstructor={isInstructor} onClose={() => setShowChat(false)}
          />
        )}
        {showPoll && (
          <LivePollPanel
            meetingId={meetingId} user={user} socket={socket}
            isInstructor={isInstructor} onClose={() => setShowPoll(false)}
          />
        )}
        {showBreakout && (
          <BreakoutRoomPanel
            meetingId={meetingId} user={user} socket={socket}
            isInstructor={isInstructor} breakoutInfo={breakoutInfo}
            onClose={() => setShowBreakout(false)}
          />
        )}
        {showLayout && (
          <LayoutSelector
            current={layoutMode}
            onChange={setLayoutMode}
            onClose={() => setShowLayout(false)}
          />
        )}

        {/* ── Live captions ────────────────────────────────── */}
        {showSubtitles && transcript.slice(-3).length > 0 && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 max-w-2xl w-full px-4">
            <div className="bg-black/75 backdrop-blur-sm rounded-xl px-5 py-3 space-y-1">
              {transcript.slice(-3).map((line, i, arr) => (
                <p key={i} className={`text-center text-sm leading-relaxed ${i === arr.length - 1 ? "text-white font-medium" : "text-white/40"}`}>
                  {line}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* ── Call controls ─────────────────────────────────── */}
        {/* Always fixed so they show in fullscreen too */}
        <div className="str-video__call-controls absolute bottom-0 left-0 right-0 z-20">
          <CallControls onLeave={onLeave} />
        </div>

        {/* ── Whiteboard overlay ── */}
        {showWhiteboard && (
          <LiveWhiteboard
            meetingId={meetingId} isInstructor={isInstructor}
            socket={socket} onClose={handleToggleWhiteboard}
          />
        )}
      </div>
    </StreamTheme>
  );
}

// ─────────────────────────────────────────────────────────────
// Student Waiting Screen
// ─────────────────────────────────────────────────────────────
function StudentWaitingScreen({ user, status, onLeave }) {
  const [dots, setDots] = useState(".");
  useEffect(() => {
    const t = setInterval(() => setDots((d) => d.length >= 3 ? "." : d + "."), 600);
    return () => clearInterval(t);
  }, []);

  if (status === "not-started") {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center p-4">
        <div className="bg-navy-900 border border-amber-500/20 rounded-2xl max-w-md w-full p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-500/15 flex items-center justify-center mx-auto mb-5">
            <Clock size={28} className="text-amber-400" />
          </div>
          <h2 className="font-display text-xl font-semibold text-white mb-2">Class Hasn't Started Yet</h2>
          <p className="text-white/40 text-sm mb-6 leading-relaxed">
            The instructor hasn't opened the class yet. This page will automatically update when they do.
          </p>
          <div className="flex items-center justify-center gap-2 text-amber-400/60 text-sm mb-7">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Waiting for instructor{dots}
          </div>
          <button onClick={onLeave} className="btn-secondary w-full text-sm">Go Back</button>
        </div>
      </div>
    );
  }

  if (status === "rejected") {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center p-4">
        <div className="bg-navy-900 border border-rose-500/20 rounded-2xl max-w-md w-full p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-rose-500/15 flex items-center justify-center mx-auto mb-5">
            <UserX size={28} className="text-rose-400" />
          </div>
          <h2 className="font-display text-xl font-semibold text-white mb-2">Access Denied</h2>
          <p className="text-white/40 text-sm mb-6 leading-relaxed">
            The instructor has not admitted you to this class.
          </p>
          <button onClick={onLeave} className="btn-primary w-full text-sm">Go Back to Classes</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center p-4">
      <div className="bg-navy-900 border border-white/10 rounded-2xl max-w-md w-full p-10 text-center">
        <div className="w-20 h-20 rounded-full bg-azure-500/20 flex items-center justify-center mx-auto mb-5 overflow-hidden ring-4 ring-azure-500/20">
          {user?.photoUrl
            ? <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" />
            : <span className="text-2xl font-bold text-azure-300">{user?.name?.[0]?.toUpperCase()}</span>}
        </div>
        <div className="relative w-14 h-14 mx-auto mb-5">
          <div className="absolute inset-0 rounded-full border-2 border-azure-500/15" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-azure-500 animate-spin" />
          <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-azure-400/40 animate-spin"
            style={{ animationDuration: "1.5s", animationDirection: "reverse" }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <Bell size={16} className="text-azure-400" />
          </div>
        </div>
        <h2 className="font-display text-xl font-semibold text-white mb-2">Waiting to be Admitted</h2>
        <p className="text-white/40 text-sm mb-2 leading-relaxed">
          Hi <strong className="text-white">{user?.name}</strong>! Your request has been sent.
        </p>
        <p className="text-white/25 text-xs mb-7">This page will automatically continue once you're admitted.</p>
        <div className="flex items-center justify-center gap-2 text-azure-400/70 text-sm mb-7">
          <div className="flex gap-1">
            {[0,1,2].map((i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-azure-400/60 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
          Waiting for instructor{dots}
        </div>
        <button onClick={onLeave} className="btn-secondary w-full text-sm">Leave Waiting Room</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────
export default function MeetingRoomPage() {
  const { meetingId: encodedId } = useParams();
  const meetingId = decodeURIComponent(encodedId).replace(/[^a-z0-9_-]/gi, "_").toLowerCase();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isInstructor = user?.role === "instructor";

  const [pageStatus,     setPageStatus]     = useState("loading");
  const [streamClient,   setStreamClient]   = useState(null);
  const [streamCall,     setStreamCall]     = useState(null);
  const [errorMsg,       setErrorMsg]       = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [breakoutInfo,   setBreakoutInfo]   = useState(null);

  const clientRef      = useRef(null);
  const callRef        = useRef(null);
  const didInit        = useRef(false);
  const socketRef      = useRef(null);
  const pollRef        = useRef(null);
  const transcriptRef  = useRef([]);

  // ── Socket setup ──────────────────────────────────────────
  useEffect(() => {
    const socket = io(window.location.origin, { withCredentials: true });
    socketRef.current = socket;

    socket.on("connect", () => {
      if (isInstructor) {
        socket.emit("join-host-room",  { meetingId });
        socket.emit("join-poll-room",  { meetingId });
        // Also join wb room as host (so students can request sync)
        socket.emit("wb-join", { meetingId });
      } else {
        socket.emit("join-student-room", { meetingId, userId: user?._id?.toString() });
        socket.emit("join-poll-room",    { meetingId });
        socket.emit("wb-join",           { meetingId });
      }
    });

    // When student is admitted — auto-join stream immediately, no refresh needed
    socket.on("student-admitted", ({ meetingId: mid }) => {
      if (mid === meetingId) {
        toast.success("✅ You've been admitted! Joining now…");
        if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
        initStream();
      }
    });

    socket.on("student-rejected", ({ meetingId: mid }) => {
      if (mid === meetingId) {
        if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
        setPageStatus("rejected");
      }
    });

    socket.on("meeting-ended", ({ meetingId: mid }) => {
      if (mid === meetingId) { toast("Class has ended", { icon: "🔔" }); navigate("/meetings"); }
    });

    socket.on("breakout-created", () => {
      toast("📋 Breakout rooms created!", { duration: 3000 });
    });

    return () => { socket.disconnect(); socketRef.current = null; };
  }, []); // eslint-disable-line

  const cleanup = async () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    try { if (callRef.current) await callRef.current.leave(); } catch {}
    try { if (clientRef.current) await clientRef.current.disconnectUser(); } catch {}
    clientRef.current = null;
    callRef.current = null;
  };

  const initStream = async () => {
    setPageStatus("connecting");
    await cleanup();
    try {
      const { data: td } = await axios.get("/api/v1/meeting/stream-token", { withCredentials: true });
      if (!td.success) throw new Error(td.message);

      const client = new StreamVideoClient({
        apiKey: td.apiKey,
        user: { id: td.userId, name: td.userName, image: td.userPhoto || "" },
        token: td.token,
      });
      clientRef.current = client;

      await axios.post("/api/v1/meeting", {
        meetingId,
        title: meetingId.startsWith("personal_") ? `${user?.name}'s Room` : "Live Class",
        status: "live",
      }, { withCredentials: true });

      const call = client.call("default", meetingId);
      await call.getOrCreate();
      await call.join({ create: true });
      callRef.current = call;

      await axios.post("/api/v1/meeting/attendance/join", { meetingId }, { withCredentials: true }).catch(() => {});

      // Check for active breakout session
      try {
        const { data: br } = await axios.get(`/api/v1/breakout/${meetingId}`, { withCredentials: true });
        if (br.session?.status === "active" && !isInstructor) {
          const myRoom = br.session.rooms.find((r) =>
            r.participants.some((p) => p.userId?.toString() === user?._id?.toString())
          );
          if (myRoom) {
            setBreakoutInfo({
              roomIndex: myRoom.roomIndex,
              roomName: myRoom.name,
              streamCallId: myRoom.streamCallId,
              endsAt: br.session.endsAt,
              status: "active",
            });
          }
        }
      } catch {}

      setStreamClient(client);
      setStreamCall(call);
      setPageStatus("ready");
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || err?.message || "Failed to connect");
      setPageStatus("error");
      await cleanup();
    }
  };

  // ── Entry ────────────────────────────────────────────────
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    const enter = async () => {
      if (isInstructor) {
        await initStream();
      } else {
        setPageStatus("connecting");
        try {
          const { data } = await axios.post(`/api/v1/meeting/${meetingId}/knock`, {}, { withCredentials: true });
          if (data.status === "admitted") {
            await initStream();
          } else if (data.status === "not-started") {
            setPageStatus("not-started");
            pollRef.current = setInterval(async () => {
              try {
                const { data: pd } = await axios.post(`/api/v1/meeting/${meetingId}/knock`, {}, { withCredentials: true });
                if (pd.status === "admitted") {
                  clearInterval(pollRef.current); pollRef.current = null;
                  toast.success("✅ Class started! Joining now…");
                  await initStream();
                } else if (pd.status === "waiting") {
                  setPageStatus("waiting");
                }
              } catch {}
            }, 5000);
          } else {
            // status === "waiting" — socket will admit them, no polling needed
            setPageStatus("waiting");
          }
        } catch (err) {
          setErrorMsg(err?.response?.data?.message || "Failed to reach meeting");
          setPageStatus("error");
        }
      }
    };
    enter();
    return () => { cleanup(); };
  }, []); // eslint-disable-line

  const handleLeave = async () => {
    try {
      await axios.post("/api/v1/meeting/attendance/leave", { meetingId }, { withCredentials: true });
      if (isInstructor) {
        await axios.patch(`/api/v1/meeting/${encodeURIComponent(meetingId)}/status`, { status: "ended" }, { withCredentials: true });
        socketRef.current?.emit("wb-close", { meetingId });
      }
    } catch {}
    await cleanup();
    navigate("/meetings");
  };

  const handleGenerateSummary = async (transcriptText) => {
    setSummaryLoading(true);
    try {
      const text = transcriptText || transcriptRef.current.join(". ") || "No transcript captured.";
      const { data } = await axios.post("/api/v1/summary/generate", {
        transcript: text,
        meetingTitle: `Class — ${new Date().toLocaleDateString()}`,
        meetingId,
      }, { withCredentials: true });
      if (data.success) toast.success("AI summary generated! Check Summaries.", { duration: 5000 });
    } catch { toast.error("Failed to generate summary"); }
    finally { setSummaryLoading(false); }
  };

  // ── Loading / error states ───────────────────────────────
  if (["loading", "connecting"].includes(pageStatus)) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center px-4">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-2 border-azure-500/15" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-azure-500 animate-spin" />
            <div className="absolute inset-3 rounded-full border-2 border-transparent border-t-azure-400/50 animate-spin"
              style={{ animationDuration: "1.5s", animationDirection: "reverse" }} />
          </div>
          <div>
            <p className="text-white text-lg font-semibold">
              {pageStatus === "connecting" ? "Joining class…" : "Checking access…"}
            </p>
            <p className="text-white/40 text-sm mt-1">Please wait…</p>
          </div>
        </div>
      </div>
    );
  }

  if (["not-started", "waiting", "rejected"].includes(pageStatus)) {
    return (
      <StudentWaitingScreen
        user={user}
        status={pageStatus}
        onLeave={() => { cleanup(); navigate("/meetings"); }}
      />
    );
  }

  if (pageStatus === "error") {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center p-4">
        <div className="bg-navy-900 border border-white/10 rounded-2xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-rose-500/15 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={28} className="text-rose-400" />
          </div>
          <h2 className="font-display text-xl font-semibold text-white mb-2">Connection Failed</h2>
          <p className="text-white/40 text-sm mb-6 leading-relaxed">{errorMsg}</p>
          <div className="flex gap-3">
            <button onClick={() => { cleanup(); navigate("/meetings"); }}
              className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 text-sm transition-all">
              Go Back
            </button>
            <button onClick={() => window.location.reload()}
              className="flex-1 py-2.5 rounded-xl bg-azure-600 hover:bg-azure-500 text-white text-sm transition-all font-medium">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <StreamVideo client={streamClient}>
      <StreamCall call={streamCall}>
        <MeetingRoom
          meetingId={meetingId}
          isInstructor={isInstructor}
          onLeave={handleLeave}
          onGenerateSummary={handleGenerateSummary}
          summaryLoading={summaryLoading}
          socket={socketRef.current}
          onTranscriptUpdate={(t) => { transcriptRef.current = t; }}
          user={user}
          breakoutInfo={breakoutInfo}
          setBreakoutInfo={setBreakoutInfo}
        />
      </StreamCall>
    </StreamVideo>
  );
}