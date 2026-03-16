import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  BarChart2, Plus, Send, X, Check, Loader,
  ChevronDown, ChevronUp, Users, StopCircle,
} from "lucide-react";
import toast from "react-hot-toast";

// ── Bar component for displaying vote results ─────────────────
function ResultBar({ option, totalVotes, isMyVote }) {
  const pct = totalVotes === 0 ? 0 : Math.round((option.voteCount / totalVotes) * 100);
  return (
    <div className={`p-3 rounded-xl border transition-all ${isMyVote ? "border-violet-500/40 bg-violet-500/8" : "border-white/6 bg-white/3"}`}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-white/80 flex-1 pr-2">{option.text}</span>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isMyVote && <span className="text-[10px] text-violet-400 bg-violet-500/15 px-1.5 py-0.5 rounded-full">Your vote</span>}
          <span className="text-sm font-semibold text-white">{pct}%</span>
          <span className="text-xs text-white/30">({option.voteCount})</span>
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${isMyVote ? "bg-violet-500" : "bg-blue-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ── Create Poll form (instructor) ─────────────────────────────
function CreatePollForm({ meetingId, onCreated, onClose }) {
  const [question, setQuestion] = useState("");
  const [options,  setOptions]  = useState(["", ""]);
  const [saving,   setSaving]   = useState(false);

  const addOption    = () => setOptions((o) => [...o, ""]);
  const removeOption = (i) => setOptions((o) => o.filter((_, idx) => idx !== i));
  const setOption    = (i, v) => setOptions((o) => o.map((x, idx) => idx === i ? v : x));

  const handleCreate = async () => {
    if (!question.trim()) return toast.error("Enter a question");
    const filled = options.filter((o) => o.trim());
    if (filled.length < 2) return toast.error("At least 2 options required");
    try {
      setSaving(true);
      const { data } = await axios.post(
        `/api/v1/poll/${meetingId}`,
        { question: question.trim(), options: filled },
        { withCredentials: true }
      );
      toast.success("Poll launched!");
      onCreated(data.poll);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to create poll");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <label className="text-xs text-white/50 mb-1.5 block">Poll Question *</label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask the class something…"
          rows={2}
          className="w-full bg-navy-900/80 border border-white/10 focus:border-violet-500/60 text-white placeholder-white/30 rounded-xl px-4 py-3 outline-none text-sm resize-none transition-all"
        />
      </div>
      <div>
        <label className="text-xs text-white/50 mb-2 block">Options *</label>
        <div className="space-y-2">
          {options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-violet-500/15 text-violet-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                {String.fromCharCode(65 + i)}
              </span>
              <input
                value={opt}
                onChange={(e) => setOption(i, e.target.value)}
                placeholder={`Option ${String.fromCharCode(65 + i)}`}
                className="flex-1 bg-navy-900/80 border border-white/10 focus:border-violet-500/60 text-white placeholder-white/30 rounded-xl px-3 py-2 outline-none text-sm transition-all"
              />
              {options.length > 2 && (
                <button onClick={() => removeOption(i)} className="p-1.5 rounded-lg hover:bg-rose-500/15 text-white/30 hover:text-rose-400 transition-all">
                  <X size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
        {options.length < 6 && (
          <button onClick={addOption} className="mt-2 text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors">
            <Plus size={12} /> Add option
          </button>
        )}
      </div>
      <div className="flex gap-2">
        <button onClick={onClose} className="flex-1 py-2 rounded-xl bg-white/5 text-white/50 text-sm hover:bg-white/10 transition-all">
          Cancel
        </button>
        <button onClick={handleCreate} disabled={saving}
          className="flex-1 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium disabled:opacity-60 flex items-center justify-center gap-2 transition-all">
          {saving ? <Loader size={14} className="animate-spin" /> : <Send size={14} />}
          {saving ? "Launching…" : "Launch Poll"}
        </button>
      </div>
    </div>
  );
}

// ── Single poll card ──────────────────────────────────────────
function PollCard({ poll, isInstructor, onVote, onClose, isLive = false }) {
  const [selectedOption, setSelectedOption] = useState(poll.myVote || null);
  const [submitting,     setSubmitting]     = useState(false);
  const [collapsed,      setCollapsed]      = useState(false);

  const hasVoted      = !!poll.myVote;
  const showResults   = hasVoted || poll.status === "closed" || isInstructor;
  const totalVotes    = poll.totalVotes || 0;

  const handleVote = async () => {
    if (!selectedOption || submitting) return;
    try {
      setSubmitting(true);
      await onVote(poll._id, selectedOption);
      toast.success("Vote submitted!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`rounded-2xl border overflow-hidden transition-all ${isLive ? "border-violet-500/40 bg-violet-500/5" : "border-white/8 bg-white/2"}`}>
      {/* Header */}
      <div className="flex items-start gap-2 p-3 cursor-pointer" onClick={() => setCollapsed((c) => !c)}>
        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${poll.status === "active" ? "bg-emerald-400 animate-pulse" : "bg-white/20"}`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white leading-snug">{poll.question}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-xs ${poll.status === "active" ? "text-emerald-400" : "text-white/30"}`}>
              {poll.status === "active" ? "Active" : "Closed"}
            </span>
            <span className="text-xs text-white/25">{totalVotes} vote{totalVotes !== 1 ? "s" : ""}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {isInstructor && poll.status === "active" && (
            <button
              onClick={(e) => { e.stopPropagation(); onClose(poll._id); }}
              className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 transition-all"
            >
              <StopCircle size={11} /> Close
            </button>
          )}
          {collapsed ? <ChevronDown size={14} className="text-white/30" /> : <ChevronUp size={14} className="text-white/30" />}
        </div>
      </div>

      {/* Body */}
      {!collapsed && (
        <div className="px-3 pb-3 space-y-2">
          {showResults ? (
            // Show results
            <div className="space-y-2">
              {poll.options.map((opt) => (
                <ResultBar
                  key={opt._id}
                  option={opt}
                  totalVotes={totalVotes}
                  isMyVote={opt._id === poll.myVote}
                />
              ))}
              {totalVotes === 0 && (
                <p className="text-xs text-white/25 text-center py-2">No votes yet</p>
              )}
            </div>
          ) : (
            // Voting UI (student, poll active, hasn't voted)
            <div className="space-y-2">
              {poll.options.map((opt) => (
                <button
                  key={opt._id}
                  onClick={() => setSelectedOption(opt._id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left text-sm transition-all ${
                    selectedOption === opt._id
                      ? "border-violet-500/60 bg-violet-500/10 text-white"
                      : "border-white/8 bg-white/3 text-white/70 hover:border-white/15 hover:bg-white/5"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                    selectedOption === opt._id ? "border-violet-500 bg-violet-500" : "border-white/20"
                  }`}>
                    {selectedOption === opt._id && <Check size={10} className="text-white" />}
                  </div>
                  {opt.text}
                </button>
              ))}
              <button
                onClick={handleVote}
                disabled={!selectedOption || submitting}
                className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium disabled:opacity-40 flex items-center justify-center gap-2 transition-all mt-1"
              >
                {submitting ? <Loader size={13} className="animate-spin" /> : <Send size={13} />}
                {submitting ? "Submitting…" : "Submit Vote"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main LivePollPanel ────────────────────────────────────────
export default function LivePollPanel({ meetingId, isInstructor, socket, onClose }) {
  const [polls,       setPolls]       = useState([]);
  const [showCreate,  setShowCreate]  = useState(false);
  const [loading,     setLoading]     = useState(true);

  const fetchPolls = useCallback(async () => {
    try {
      const { data } = await axios.get(`/api/v1/poll/${meetingId}`, { withCredentials: true });
      setPolls(data.polls || []);
    } catch {} finally { setLoading(false); }
  }, [meetingId]);

  useEffect(() => { fetchPolls(); }, [fetchPolls]);

  // ── Socket: live poll events ──────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const onLaunched = (poll) => {
      setPolls((prev) => [poll, ...prev]);
      if (!isInstructor) toast("📊 A new poll has been launched!", { duration: 4000 });
    };
    const onUpdated = (poll) => {
      setPolls((prev) => prev.map((p) => p._id === poll._id ? poll : p));
    };
    const onClosed = (poll) => {
      setPolls((prev) => prev.map((p) => p._id === poll._id ? poll : p));
      if (!isInstructor) toast("Poll closed. Results are now visible.", { duration: 3000 });
    };

    socket.on("poll-launched", onLaunched);
    socket.on("poll-updated",  onUpdated);
    socket.on("poll-closed",   onClosed);

    return () => {
      socket.off("poll-launched", onLaunched);
      socket.off("poll-updated",  onUpdated);
      socket.off("poll-closed",   onClosed);
    };
  }, [socket, isInstructor]);

  const handleVote = async (pollId, optionId) => {
    const { data } = await axios.post(
      `/api/v1/poll/${pollId}/vote`,
      { optionId },
      { withCredentials: true }
    );
    setPolls((prev) => prev.map((p) => p._id === data.poll._id ? data.poll : p));
  };

  const handleClose = async (pollId) => {
    try {
      const { data } = await axios.patch(`/api/v1/poll/${pollId}/close`, {}, { withCredentials: true });
      setPolls((prev) => prev.map((p) => p._id === data.poll._id ? data.poll : p));
      toast.success("Poll closed");
    } catch { toast.error("Failed to close poll"); }
  };

  const handleCreated = (newPoll) => {
    setPolls((prev) => [newPoll, ...prev]);
    setShowCreate(false);
  };

  const activePolls = polls.filter((p) => p.status === "active");
  const closedPolls = polls.filter((p) => p.status === "closed");

  return (
    <div className="absolute right-4 top-16 z-30 w-88 bg-navy-900/97 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
      style={{ width: "22rem" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/8 bg-white/2 flex-shrink-0">
        <div className="flex items-center gap-2">
          <BarChart2 size={14} className="text-violet-400" />
          <span className="text-sm font-semibold text-white">Live Polls</span>
          {activePolls.length > 0 && (
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {activePolls.length} active
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {isInstructor && !showCreate && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-violet-600/80 hover:bg-violet-500 text-white transition-all"
            >
              <Plus size={12} /> New Poll
            </button>
          )}
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-white transition-all">
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="border-b border-white/5">
          <CreatePollForm meetingId={meetingId} onCreated={handleCreated} onClose={() => setShowCreate(false)} />
        </div>
      )}

      {/* Poll list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {loading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => <div key={i} className="h-20 rounded-xl shimmer" />)}
          </div>
        ) : polls.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-3">
              <BarChart2 size={20} className="text-violet-400/50" />
            </div>
            <p className="text-white/30 text-sm">
              {isInstructor ? "Create a poll to engage your class" : "No polls yet"}
            </p>
            {isInstructor && (
              <button onClick={() => setShowCreate(true)}
                className="mt-3 text-xs px-3 py-1.5 rounded-lg bg-violet-600/80 hover:bg-violet-500 text-white transition-all flex items-center gap-1.5">
                <Plus size={12} /> Create First Poll
              </button>
            )}
          </div>
        ) : (
          <>
            {activePolls.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-white/30 font-medium uppercase tracking-wide px-1">Active</p>
                {activePolls.map((poll) => (
                  <PollCard
                    key={poll._id}
                    poll={poll}
                    isInstructor={isInstructor}
                    onVote={handleVote}
                    onClose={handleClose}
                    isLive
                  />
                ))}
              </div>
            )}
            {closedPolls.length > 0 && (
              <div className="space-y-2 mt-3">
                <p className="text-xs text-white/20 font-medium uppercase tracking-wide px-1">Closed</p>
                {closedPolls.map((poll) => (
                  <PollCard
                    key={poll._id}
                    poll={poll}
                    isInstructor={isInstructor}
                    onVote={handleVote}
                    onClose={handleClose}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-white/5 flex-shrink-0">
        <p className="text-xs text-white/20 text-center">{polls.length} poll{polls.length !== 1 ? "s" : ""} this session</p>
      </div>
    </div>
  );
}