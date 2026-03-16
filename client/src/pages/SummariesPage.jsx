import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import {
  FileText, Download, Eye, Calendar, Search, BookOpen,
  Sparkles, Subtitles, X, RefreshCw, Trash2, AlertTriangle
} from "lucide-react";
import { format } from "date-fns";

export default function SummariesPage() {
  const { user } = useAuth();
  const isInstructor = user?.role === "instructor";

  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewing, setViewing] = useState(null);
  const [viewTab, setViewTab] = useState("summary");
  const [deleteConfirm, setDeleteConfirm] = useState(null); // meetingId to confirm
  const [deleting, setDeleting] = useState(false);

  const fetchSummaries = () => {
    setLoading(true);
    axios
      .get("/api/v1/summary", { withCredentials: true })
      .then(({ data }) => setSummaries(data.summaries || []))
      .catch(() => toast.error("Failed to load summaries"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSummaries(); }, []);

  const openViewing = async (s) => {
    try {
      const { data } = await axios.get(`/api/v1/summary/${s.meetingId}`, { withCredentials: true });
      setViewing(data.summary || s);
    } catch {
      setViewing(s);
    }
    setViewTab("summary");
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await axios.delete(`/api/v1/summary/${deleteConfirm}`, { withCredentials: true });
      toast.success("Summary deleted — removed for all users.");
      setSummaries((prev) => prev.filter((s) => s.meetingId !== deleteConfirm));
      setDeleteConfirm(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete summary");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = summaries.filter(
    (s) =>
      (s.meetingTitle || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.meetingId || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="section-title">Class Summaries</h1>
          <p className="text-white/35 text-sm mt-1">
            AI-generated summaries — auto-saved after every live session
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchSummaries}
            className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white border border-white/10 hover:border-white/20 px-3 py-2 rounded-lg transition-all"
          >
            <RefreshCw size={12} /> Refresh
          </button>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              className="input pl-9 py-2 text-sm w-52"
              placeholder="Search summaries…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-500/8 border border-emerald-500/20">
        <Sparkles size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
        <p className="text-white/55 text-sm leading-relaxed">
          {isInstructor ? (
            <>Summaries are <strong className="text-white">automatically generated</strong> when you end a live class. You can delete a summary — it will be removed for students too.</>
          ) : (
            <>Class summaries are <strong className="text-white">automatically saved</strong> after each live session. Review key topics and subtitles here anytime.</>
          )}
        </p>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-48 rounded-2xl shimmer" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <FileText size={40} className="text-white/10 mb-4" />
          <p className="text-white/30 font-medium">No summaries yet</p>
          <p className="text-white/20 text-sm mt-1">
            {search ? "No summaries match your search" :
              isInstructor ? "Summaries appear automatically when you end a live class" :
              "Your teachers' class summaries will appear here"}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s) => (
            <div key={s._id || s.meetingId} className="card-hover p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-azure-500/15 flex items-center justify-center">
                  <FileText size={17} className="text-azure-400" />
                </div>
                <div className="flex items-center gap-1.5">
                  {s.aiGenerated && (
                    <span className="flex items-center gap-1 text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      <Sparkles size={9} /> AI
                    </span>
                  )}
                  {s.pdfPath && <span className="badge-blue text-xs">PDF</span>}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-white text-sm leading-snug">{s.meetingTitle}</h3>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  {s.generatedBy?.name && (
                    <span className="text-white/30 text-xs">{s.generatedBy.name}</span>
                  )}
                  <span className="text-white/25 text-xs flex items-center gap-1">
                    <Calendar size={9} /> {format(new Date(s.createdAt), "MMM d, yyyy · h:mm a")}
                  </span>
                </div>
              </div>

              <div className="flex gap-1.5 flex-wrap">
                {s.summary && (
                  <span className="text-xs bg-azure-500/10 text-azure-400 border border-azure-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <BookOpen size={9} /> Summary
                  </span>
                )}
                {s.subtitles && (
                  <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Subtitles size={9} /> Subtitles
                  </span>
                )}
              </div>

              {s.summary && (
                <p className="text-xs text-white/40 line-clamp-2 leading-relaxed">
                  {s.summary.replace(/[#*•]/g, "").slice(0, 130)}…
                </p>
              )}

              <div className="flex gap-2 mt-auto pt-2 border-t border-white/5">
                <button
                  onClick={() => openViewing(s)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/5 hover:bg-white/8 text-white/60 hover:text-white text-xs transition-all"
                >
                  <Eye size={12} /> View
                </button>
                {s.pdfPath && (
                  <a
                    href={s.pdfPath}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-azure-600/20 hover:bg-azure-600/30 text-azure-400 text-xs transition-all"
                  >
                    <Download size={12} /> PDF
                  </a>
                )}
                {/* Delete — instructor only */}
                {isInstructor && (
                  <button
                    onClick={() => setDeleteConfirm(s.meetingId)}
                    className="px-3 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs transition-all"
                    title="Delete summary"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Delete confirmation modal ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-sm p-6 text-center animate-slide-up">
            <div className="w-14 h-14 rounded-full bg-rose-500/15 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={24} className="text-rose-400" />
            </div>
            <h3 className="font-display text-lg font-semibold text-white mb-2">Delete Summary?</h3>
            <p className="text-white/40 text-sm mb-1 leading-relaxed">
              This summary will be removed from <strong className="text-white">all users</strong> — including students.
            </p>
            <p className="text-white/25 text-xs mb-6">
              The meeting attendance and recording are not affected.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 btn-secondary text-sm"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><Trash2 size={14} /> Delete</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── View modal ── */}
      {viewing && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-2xl flex flex-col max-h-[90vh] animate-slide-up">
            <div className="p-6 border-b border-white/6 flex items-start justify-between gap-4 flex-shrink-0">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h2 className="font-display text-lg font-semibold text-white truncate">{viewing.meetingTitle}</h2>
                  {viewing.aiGenerated && (
                    <span className="flex items-center gap-1 text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full flex-shrink-0">
                      <Sparkles size={9} /> AI Generated
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/30">
                  {format(new Date(viewing.createdAt), "MMMM d, yyyy · h:mm a")}
                  {viewing.generatedBy?.name && ` · by ${viewing.generatedBy.name}`}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {viewing.pdfPath && (
                  <a href={viewing.pdfPath} target="_blank" rel="noopener noreferrer"
                    className="btn-primary text-xs py-2 px-3 flex items-center gap-1.5">
                    <Download size={12} /> PDF
                  </a>
                )}
                <button onClick={() => setViewing(null)}
                  className="p-2 rounded-xl text-white/30 hover:text-white hover:bg-white/5 transition-all">
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-3 border-b border-white/6 flex-shrink-0 overflow-x-auto">
              {[
                { id: "summary", label: "Summary", icon: BookOpen, show: !!viewing.summary },
                { id: "subtitles", label: "Subtitles", icon: Subtitles, show: !!viewing.subtitles },
                { id: "transcript", label: "Transcript", icon: FileText, show: true },
              ].filter((t) => t.show).map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setViewTab(id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    viewTab === id ? "bg-azure-600 text-white" : "text-white/40 hover:text-white/70"
                  }`}>
                  <Icon size={12} /> {label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {viewTab === "summary" && viewing.summary && (
                <div className="space-y-2">
                  {viewing.summary.split("\n").filter(Boolean).map((line, i) => (
                    <p key={i} className={`text-sm leading-relaxed ${
                      line.match(/^\d\./) || (line === line.toUpperCase() && line.trim().length > 3)
                        ? "text-azure-400 font-semibold mt-4 first:mt-0"
                        : line.startsWith("•") || line.startsWith("-")
                        ? "text-white/70 pl-4"
                        : "text-white/60"
                    }`}>{line}</p>
                  ))}
                </div>
              )}
              {viewTab === "subtitles" && viewing.subtitles && (
                <div className="space-y-1.5 font-mono">
                  {viewing.subtitles.split("\n").filter(Boolean).map((line, i) => (
                    <p key={i} className="text-xs text-white/60 leading-relaxed">{line}</p>
                  ))}
                </div>
              )}
              {viewTab === "transcript" && (
                <div className="space-y-2">
                  {viewing.transcript
                    ? viewing.transcript.split(/[.\n]/).filter((s) => s.trim().length > 3).map((line, i) => (
                        <p key={i} className="text-sm text-white/55 leading-relaxed">{line.trim()}.</p>
                      ))
                    : <p className="text-white/30 text-sm italic">No transcript was captured for this session.</p>
                  }
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}