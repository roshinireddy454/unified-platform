import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import {
  MessageCircle, Send, CheckCircle, Clock, User,
  Plus, X, ChevronDown, ChevronUp, BookOpen, AlertCircle
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// ─── Single Doubt Thread ──────────────────────────────────────
function DoubtCard({ doubt, onReply, onResolve, isInstructor }) {
  const [expanded, setExpanded] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const inputRef = useRef(null);

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      await onReply(doubt._id, replyText.trim());
      setReplyText("");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={`card border ${doubt.isResolved ? "border-emerald-500/20" : "border-white/6"} transition-all`}>
      {/* Header */}
      <div
        className="flex items-start gap-3 p-5 cursor-pointer"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
          doubt.isResolved ? "bg-emerald-500/15" : "bg-amber-500/15"
        }`}>
          {doubt.isResolved
            ? <CheckCircle size={16} className="text-emerald-400" />
            : <AlertCircle size={16} className="text-amber-400" />
          }
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {isInstructor && doubt.student && (
              <span className="text-xs text-azure-400 font-medium">
                {doubt.student.name}
              </span>
            )}
            {doubt.courseId && (
              <span className="flex items-center gap-1 text-xs text-white/30">
                <BookOpen size={9} /> {doubt.courseId.courseTitle}
              </span>
            )}
            <span className="text-white/20 text-xs ml-auto">
              {formatDistanceToNow(new Date(doubt.createdAt), { addSuffix: true })}
            </span>
          </div>
          <p className="text-sm text-white/80 leading-snug">{doubt.question}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-white/30 flex items-center gap-1">
              <MessageCircle size={10} /> {doubt.replies?.length || 0} replies
            </span>
            {doubt.isResolved && (
              <span className="badge-green text-xs flex items-center gap-1">
                <CheckCircle size={9} /> Resolved
              </span>
            )}
          </div>
        </div>

        <div className="text-white/30 flex-shrink-0">
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </div>
      </div>

      {/* Expanded: replies + input */}
      {expanded && (
        <div className="border-t border-white/5 px-5 pb-5">
          {/* Reply thread */}
          <div className="mt-4 space-y-3">
            {doubt.replies?.length === 0 && (
              <p className="text-white/25 text-xs italic text-center py-2">
                No replies yet.
              </p>
            )}
            {doubt.replies?.map((r, i) => (
              <div key={i} className={`flex items-start gap-2.5 ${
                r.sender?.role === "instructor" ? "flex-row-reverse" : ""
              }`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
                  r.sender?.role === "instructor"
                    ? "bg-azure-500/20 text-azure-400"
                    : "bg-white/10 text-white/50"
                }`}>
                  {r.sender?.name?.[0]?.toUpperCase() || "?"}
                </div>
                <div className={`flex-1 min-w-0 ${r.sender?.role === "instructor" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                  <div className={`px-3 py-2 rounded-xl text-sm max-w-[85%] ${
                    r.sender?.role === "instructor"
                      ? "bg-azure-500/15 text-azure-100 rounded-tr-sm"
                      : "bg-white/5 text-white/70 rounded-tl-sm"
                  }`}>
                    {r.message}
                  </div>
                  <span className="text-white/20 text-xs">
                    {r.sender?.name} · {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Reply input */}
          {!doubt.isResolved && (
            <div className="mt-4 flex gap-2">
              <input
                ref={inputRef}
                className="input flex-1 text-sm py-2"
                placeholder={isInstructor ? "Reply to student…" : "Add a follow-up…"}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleReply()}
              />
              <button
                onClick={handleReply}
                disabled={sending || !replyText.trim()}
                className="btn-primary px-3 py-2 disabled:opacity-50"
              >
                {sending ? <Loader size={14} className="animate-spin" /> : <Send size={14} />}
              </button>
            </div>
          )}

          {/* Resolve button — instructor only */}
          {isInstructor && !doubt.isResolved && (
            <button
              onClick={() => onResolve(doubt._id)}
              className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 text-xs transition-all"
            >
              <CheckCircle size={12} /> Mark as Resolved
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Doubt Page ──────────────────────────────────────────
export default function DoubtPage() {
  const { user } = useAuth();
  const isInstructor = user?.role === "instructor";

  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [question, setQuestion] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState("all"); // "all" | "open" | "resolved"

  const fetchDoubts = async () => {
    try {
      const endpoint = isInstructor ? "/api/v1/doubt/all" : "/api/v1/doubt/my";
      const { data } = await axios.get(endpoint, { withCredentials: true });
      setDoubts(data.doubts || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoubts();
  }, []); // eslint-disable-line

  const handleSubmitDoubt = async () => {
    if (!question.trim()) return;
    setSubmitting(true);
    try {
      await axios.post("/api/v1/doubt", { question }, { withCredentials: true });
      toast.success("Doubt submitted! Your teacher will reply soon.");
      setQuestion("");
      setShowForm(false);
      fetchDoubts();
    } catch {
      toast.error("Failed to submit doubt");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (doubtId, message) => {
    try {
      await axios.post(`/api/v1/doubt/${doubtId}/reply`, { message }, { withCredentials: true });
      fetchDoubts();
    } catch {
      toast.error("Failed to send reply");
    }
  };

  const handleResolve = async (doubtId) => {
    try {
      await axios.patch(`/api/v1/doubt/${doubtId}/resolve`, {}, { withCredentials: true });
      toast.success("Doubt marked as resolved");
      fetchDoubts();
    } catch {
      toast.error("Failed to resolve doubt");
    }
  };

  const filtered = doubts.filter((d) => {
    if (filter === "open") return !d.isResolved;
    if (filter === "resolved") return d.isResolved;
    return true;
  });

  const openCount = doubts.filter((d) => !d.isResolved).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="section-title">
            {isInstructor ? "Student Doubts" : "My Doubts"}
          </h1>
          <p className="text-white/35 text-sm mt-1">
            {isInstructor
              ? `${openCount} open doubt${openCount !== 1 ? "s" : ""} awaiting your response`
              : "Ask questions — your teacher will reply here"}
          </p>
        </div>
        {!isInstructor && (
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus size={14} /> Ask a Doubt
          </button>
        )}
      </div>

      {/* Ask doubt form */}
      {showForm && !isInstructor && (
        <div className="card p-5 border border-azure-500/20">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-white text-sm">Ask a Question</h3>
            <button onClick={() => setShowForm(false)} className="text-white/30 hover:text-white">
              <X size={15} />
            </button>
          </div>
          <textarea
            className="input w-full resize-none text-sm"
            rows={3}
            placeholder="Type your question clearly… e.g. 'Can you explain what useEffect does with an empty dependency array?'"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setShowForm(false)}
              className="btn-secondary flex-1 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitDoubt}
              disabled={submitting || !question.trim()}
              className="btn-primary flex-1 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send size={14} />
              )}
              Submit Doubt
            </button>
          </div>
        </div>
      )}

      {/* Info banner for instructor */}
      {isInstructor && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-azure-500/8 border border-azure-500/20">
          <MessageCircle size={16} className="text-azure-400 mt-0.5 flex-shrink-0" />
          <p className="text-white/55 text-sm leading-relaxed">
            Students can only see their own doubts. You see all doubts from all students.
            Reply to help them, then mark as resolved when done.
          </p>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 bg-navy-900/60 rounded-xl p-1 border border-white/5 w-fit">
        {[
          { id: "all", label: `All (${doubts.length})` },
          { id: "open", label: `Open (${openCount})` },
          { id: "resolved", label: `Resolved (${doubts.length - openCount})` },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === id ? "bg-azure-600 text-white" : "text-white/40 hover:text-white/70"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Doubts list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-2xl shimmer" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <MessageCircle size={40} className="text-white/10 mb-4" />
          <p className="text-white/30 font-medium">
            {filter === "resolved"
              ? "No resolved doubts"
              : filter === "open"
              ? "No open doubts — great!"
              : isInstructor
              ? "No student doubts yet"
              : "You haven't asked any doubts yet"}
          </p>
          {!isInstructor && filter !== "resolved" && (
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary text-sm mt-4 flex items-center gap-1"
            >
              <Plus size={13} /> Ask your first doubt
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((d) => (
            <DoubtCard
              key={d._id}
              doubt={d}
              onReply={handleReply}
              onResolve={handleResolve}
              isInstructor={isInstructor}
            />
          ))}
        </div>
      )}
    </div>
  );
}