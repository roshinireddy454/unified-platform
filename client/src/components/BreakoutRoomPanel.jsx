import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  LayoutGrid, Plus, Play, Square, Users, RefreshCw,
  X, Send, Shuffle, ArrowRight, Loader, Clock, ChevronDown,
} from "lucide-react";

// ── helpers ───────────────────────────────────────────────────
function timeLeft(endsAt) {
  if (!endsAt) return null;
  const diff = Math.max(0, Math.floor((new Date(endsAt) - Date.now()) / 1000));
  const m = Math.floor(diff / 60);
  const s = diff % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ── Room card (instructor view) ───────────────────────────────
function RoomCard({ room, allStudents, onMove }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="rounded-xl border border-white/8 bg-white/2 overflow-hidden">
      <div
        className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-white/3 transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-teal-500/20 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-teal-400">{room.roomIndex}</span>
          </div>
          <span className="text-sm font-medium text-white">{room.name}</span>
          <span className="text-xs text-white/30">({room.participants.length})</span>
        </div>
        <ChevronDown size={14} className={`text-white/30 transition-transform ${open ? "" : "-rotate-90"}`} />
      </div>

      {open && (
        <div className="px-3 pb-3 space-y-1.5">
          {room.participants.length === 0 ? (
            <p className="text-xs text-white/20 text-center py-2">No students assigned</p>
          ) : (
            room.participants.map((p) => (
              <div key={p.userId} className="flex items-center gap-2 p-2 rounded-lg bg-white/3">
                <div className="w-6 h-6 rounded-full bg-azure-500/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-azure-300">
                  {p.name?.[0]?.toUpperCase()}
                </div>
                <span className="text-xs text-white/70 flex-1 truncate">{p.name}</span>
                {/* Move button */}
                <select
                  className="text-xs bg-navy-900/80 border border-white/10 text-white/50 rounded-lg px-1.5 py-1 outline-none cursor-pointer hover:border-white/20 transition-all"
                  defaultValue=""
                  onChange={(e) => { if (e.target.value) onMove(p.userId, Number(e.target.value)); e.target.value = ""; }}
                >
                  <option value="">Move…</option>
                  {allStudents
                    .filter((_, i) => i !== room.roomIndex - 1)
                    .map((_, i) => {
                      const targetIdx = i >= room.roomIndex - 1 ? i + 2 : i + 1;
                      return <option key={targetIdx} value={targetIdx}>Room {targetIdx}</option>;
                    })}
                </select>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ── Student room view (when in a breakout) ────────────────────
function StudentBreakoutView({ breakoutInfo, onClose }) {
  const [timer, setTimer] = useState(timeLeft(breakoutInfo?.endsAt));

  useEffect(() => {
    if (!breakoutInfo?.endsAt) return;
    const t = setInterval(() => setTimer(timeLeft(breakoutInfo.endsAt)), 1000);
    return () => clearInterval(t);
  }, [breakoutInfo?.endsAt]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 space-y-3">
        {/* Room info */}
        <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/25 text-center">
          <p className="text-xs text-teal-400/70 mb-1 uppercase tracking-wide font-medium">You are in</p>
          <p className="text-xl font-bold text-white">{breakoutInfo?.roomName || "Breakout Room"}</p>
          {timer && (
            <div className="flex items-center justify-center gap-1.5 mt-2 text-sm text-amber-400">
              <Clock size={13} />
              <span className="font-mono">{timer}</span> remaining
            </div>
          )}
        </div>

        <div className="p-3 rounded-xl bg-white/3 border border-white/5 text-center">
          <p className="text-xs text-white/40 leading-relaxed">
            You are currently in a breakout room. You will be automatically returned to the main class when the session ends or the instructor closes rooms.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Main Panel ────────────────────────────────────────────────
export default function BreakoutRoomPanel({
  meetingId, user, socket, isInstructor, breakoutInfo, onClose,
}) {
  const [session,      setSession]      = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [participants, setParticipants] = useState([]); // all users in meeting
  const [assignments,  setAssignments]  = useState({}); // { userId: roomIndex }
  const [roomCount,    setRoomCount]    = useState(2);
  const [duration,     setDuration]     = useState(0);
  const [creating,     setCreating]     = useState(false);
  const [starting,     setStarting]     = useState(false);
  const [closing,      setClosing]      = useState(false);
  const [broadcast,    setBroadcast]    = useState("");
  const [sending,      setSending]      = useState(false);
  const [timer,        setTimer]        = useState(null);

  // ── Fetch current session ─────────────────────────────────
  const fetchSession = useCallback(async () => {
    try {
      const { data } = await axios.get(`/api/v1/breakout/${meetingId}`, { withCredentials: true });
      setSession(data.session || null);
      if (data.session?.status === "active" && data.session?.endsAt) {
        setTimer(timeLeft(data.session.endsAt));
      }
    } catch {} finally { setLoading(false); }
  }, [meetingId]);

  // ── Fetch attendance (to get list of present students) ────
  const fetchParticipants = useCallback(async () => {
    try {
      const { data } = await axios.get(`/api/v1/meeting/${meetingId}/attendance`, { withCredentials: true });
      const active = (data.attendance || [])
        .filter((a) => !a.leaveTime && a.userId?.role === "student")
        .map((a) => a.userId);
      setParticipants(active);
    } catch {}
  }, [meetingId]);

  useEffect(() => {
    fetchSession();
    if (isInstructor) fetchParticipants();
  }, [fetchSession, fetchParticipants, isInstructor]);

  // Timer tick
  useEffect(() => {
    if (!session?.endsAt) return;
    const t = setInterval(() => setTimer(timeLeft(session.endsAt)), 1000);
    return () => clearInterval(t);
  }, [session?.endsAt]);

  // ── Real-time socket events ──────────────────────────────
  useEffect(() => {
    if (!socket) return;
    const onCreated  = ({ session }) => { setSession(session); toast("📋 Breakout rooms created"); };
    const onUpdated  = ({ session }) => { setSession(session); };
    const onStarted  = ({ session }) => { setSession(session); };
    const onClosed   = () => { setSession(null); setAssignments({}); toast("✅ Breakout rooms closed"); };

    socket.on("breakout-created", onCreated);
    socket.on("breakout-updated", onUpdated);
    socket.on("breakout-started", onStarted);
    socket.on("breakout-closed",  onClosed);

    return () => {
      socket.off("breakout-created", onCreated);
      socket.off("breakout-updated", onUpdated);
      socket.off("breakout-started", onStarted);
      socket.off("breakout-closed",  onClosed);
    };
  }, [socket]);

  // ── Actions ───────────────────────────────────────────────
  const handleCreate = async () => {
    setCreating(true);
    try {
      const { data } = await axios.post(`/api/v1/breakout/${meetingId}`, {
        roomCount: Number(roomCount),
        durationMinutes: Number(duration),
      }, { withCredentials: true });
      setSession(data.session);
      setAssignments({});
      toast.success(`${roomCount} breakout rooms created!`);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to create rooms");
    } finally { setCreating(false); }
  };

  const handleAutoAssign = async () => {
    if (!session) return;
    const userIds = participants.map((p) => p._id || p);
    try {
      const { data } = await axios.post(`/api/v1/breakout/${meetingId}/auto-assign`, { userIds }, { withCredentials: true });
      setSession(data.session);
      toast.success("Students auto-assigned!");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to auto-assign");
    }
  };

  const handleAssignStudent = async (userId, roomIndex) => {
    const newAssignments = { ...assignments, [userId]: roomIndex };
    setAssignments(newAssignments);
    // Build and send assignment array
    const assignmentArr = Object.entries(newAssignments).map(([uid, ri]) => ({ userId: uid, roomIndex: ri }));
    try {
      const { data } = await axios.post(`/api/v1/breakout/${meetingId}/assign`, { assignments: assignmentArr }, { withCredentials: true });
      setSession(data.session);
    } catch {}
  };

  const handleMoveParticipant = async (userId, toRoomIndex) => {
    try {
      const { data } = await axios.patch(`/api/v1/breakout/${meetingId}/move`, { userId, toRoomIndex }, { withCredentials: true });
      setSession(data.session);
      toast.success("Participant moved!");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to move participant");
    }
  };

  const handleStart = async () => {
    setStarting(true);
    try {
      const { data } = await axios.post(`/api/v1/breakout/${meetingId}/start`, {}, { withCredentials: true });
      setSession(data.session);
      toast.success("🚀 Breakout rooms started!");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to start rooms");
    } finally { setStarting(false); }
  };

  const handleClose = async () => {
    setClosing(true);
    try {
      await axios.post(`/api/v1/breakout/${meetingId}/close`, {}, { withCredentials: true });
      setSession(null);
      setAssignments({});
      toast.success("Breakout rooms closed. Everyone brought back.");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to close rooms");
    } finally { setClosing(false); }
  };

  const handleBroadcast = async () => {
    if (!broadcast.trim()) return;
    setSending(true);
    try {
      await axios.post(`/api/v1/breakout/${meetingId}/broadcast`, { message: broadcast }, { withCredentials: true });
      setBroadcast("");
      toast.success("Message broadcast to all rooms!");
    } catch (e) {
      toast.error("Failed to broadcast");
    } finally { setSending(false); }
  };

  const unassigned = participants.filter((p) => {
    const id = p._id?.toString() || p.toString();
    return !session?.rooms?.some((r) => r.participants?.some((rp) => rp.userId?.toString() === id));
  });

  // ── Panel render ──────────────────────────────────────────
  return (
    <div
      className="absolute right-4 top-16 z-30 bg-navy-900/97 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      style={{ width: "22rem", maxHeight: "calc(100vh - 120px)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/8 bg-white/2 flex-shrink-0">
        <div className="flex items-center gap-2">
          <LayoutGrid size={14} className="text-teal-400" />
          <span className="text-sm font-semibold text-white">Breakout Rooms</span>
          {session?.status === "active" && (
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Active
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={fetchSession} className="p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-white transition-all">
            <RefreshCw size={12} />
          </button>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-white transition-all">
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader size={24} className="text-white/20 animate-spin" />
          </div>
        ) : !isInstructor ? (
          /* ── Student view ── */
          <StudentBreakoutView breakoutInfo={breakoutInfo} onClose={onClose} />
        ) : (
          /* ── Instructor view ── */
          <div className="p-4 space-y-4">

            {/* No session yet — create UI */}
            {!session && (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-teal-500/8 border border-teal-500/20">
                  <p className="text-xs text-teal-300/70 leading-relaxed">
                    Create breakout rooms to split students into smaller groups. Each group gets its own private video call.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-white/40 mb-1.5 block">Number of rooms</label>
                    <input
                      type="number" min={2} max={20}
                      value={roomCount}
                      onChange={(e) => setRoomCount(e.target.value)}
                      className="w-full bg-navy-900/80 border border-white/10 text-white rounded-xl px-3 py-2 text-sm outline-none focus:border-teal-500/60 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/40 mb-1.5 block">Duration (min, 0=unlimited)</label>
                    <input
                      type="number" min={0} max={120}
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full bg-navy-900/80 border border-white/10 text-white rounded-xl px-3 py-2 text-sm outline-none focus:border-teal-500/60 transition-all"
                    />
                  </div>
                </div>

                <button
                  onClick={handleCreate}
                  disabled={creating}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-teal-600/80 hover:bg-teal-500 text-white text-sm font-medium transition-all disabled:opacity-60"
                >
                  {creating ? <Loader size={14} className="animate-spin" /> : <Plus size={14} />}
                  {creating ? "Creating…" : `Create ${roomCount} Rooms`}
                </button>
              </div>
            )}

            {/* Session exists */}
            {session && (
              <div className="space-y-4">

                {/* Status bar */}
                <div className={`flex items-center justify-between p-3 rounded-xl ${
                  session.status === "active"
                    ? "bg-emerald-500/10 border border-emerald-500/20"
                    : "bg-amber-500/8 border border-amber-500/15"
                }`}>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {session.status === "active" ? "Rooms Active" : "Rooms Ready (not started)"}
                    </p>
                    <p className="text-xs text-white/40">
                      {session.rooms?.length} rooms · {session.rooms?.reduce((s, r) => s + r.participants.length, 0)} students assigned
                    </p>
                  </div>
                  {session.status === "active" && timer && (
                    <div className="flex items-center gap-1 text-amber-400 text-sm font-mono">
                      <Clock size={13} /> {timer}
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  {session.status === "pending" && (
                    <>
                      <button
                        onClick={handleAutoAssign}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-azure-600/70 hover:bg-azure-500 text-white text-xs font-medium transition-all"
                      >
                        <Shuffle size={12} /> Auto-assign
                      </button>
                      <button
                        onClick={handleStart}
                        disabled={starting}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-all disabled:opacity-60"
                      >
                        {starting ? <Loader size={12} className="animate-spin" /> : <Play size={12} />}
                        {starting ? "Starting…" : "Start Rooms"}
                      </button>
                    </>
                  )}
                  {session.status === "active" && (
                    <>
                      <button
                        onClick={handleClose}
                        disabled={closing}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-rose-600/80 hover:bg-rose-500 text-white text-xs font-medium transition-all disabled:opacity-60"
                      >
                        {closing ? <Loader size={12} className="animate-spin" /> : <Square size={12} />}
                        {closing ? "Closing…" : "Close All Rooms"}
                      </button>
                    </>
                  )}
                </div>

                {/* Broadcast (active only) */}
                {session.status === "active" && (
                  <div className="flex gap-2">
                    <input
                      value={broadcast}
                      onChange={(e) => setBroadcast(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleBroadcast()}
                      placeholder="Broadcast to all rooms…"
                      className="flex-1 bg-navy-900/80 border border-white/10 focus:border-teal-500/60 text-white placeholder-white/25 rounded-xl px-3 py-2 text-xs outline-none transition-all"
                    />
                    <button
                      onClick={handleBroadcast}
                      disabled={!broadcast.trim() || sending}
                      className="p-2 rounded-xl bg-teal-600/80 hover:bg-teal-500 text-white transition-all disabled:opacity-40"
                    >
                      <Send size={14} />
                    </button>
                  </div>
                )}

                {/* Unassigned students */}
                {session.status === "pending" && unassigned.length > 0 && (
                  <div>
                    <p className="text-xs text-white/40 mb-2 flex items-center gap-1.5">
                      <Users size={11} /> Unassigned ({unassigned.length})
                    </p>
                    <div className="space-y-1.5">
                      {unassigned.map((p) => (
                        <div key={p._id} className="flex items-center gap-2 p-2 rounded-lg bg-white/3 border border-white/5">
                          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white/50">
                            {p.name?.[0]?.toUpperCase()}
                          </div>
                          <span className="text-xs text-white/60 flex-1 truncate">{p.name}</span>
                          <select
                            className="text-xs bg-navy-900/80 border border-white/10 text-white/50 rounded-lg px-1.5 py-1 outline-none cursor-pointer hover:border-white/20 transition-all"
                            defaultValue=""
                            onChange={(e) => { if (e.target.value) handleAssignStudent(p._id, Number(e.target.value)); e.target.value = ""; }}
                          >
                            <option value="">Assign…</option>
                            {session.rooms.map((r) => (
                              <option key={r.roomIndex} value={r.roomIndex}>{r.name}</option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Room list */}
                <div className="space-y-2">
                  {(session.rooms || []).map((room) => (
                    <RoomCard
                      key={room.roomIndex}
                      room={room}
                      allStudents={session.rooms}
                      onMove={handleMoveParticipant}
                    />
                  ))}
                </div>

                {/* Create new session */}
                {session.status !== "pending" && (
                  <button
                    onClick={() => { setSession(null); setAssignments({}); }}
                    className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/8 text-white/40 hover:text-white/60 text-xs transition-all border border-white/6"
                  >
                    + Create New Breakout Session
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
