import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Trophy, CheckCircle, XCircle, MinusCircle, Clock, BarChart2,
  ArrowLeft, ChevronDown, ChevronUp
} from "lucide-react";

export default function TestResultPage() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedQ, setExpandedQ] = useState(null);

  useEffect(() => {
    axios.get(`/api/v1/test/${testId}/result`, { withCredentials: true })
      .then(({ data }) => setResult(data))
      .catch(() => navigate("/tests"))
      .finally(() => setLoading(false));
  }, [testId]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-10 h-10 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
      </div>
    );
  }

  if (!result) return null;

  const { submission, rank, totalStudents } = result;
  const pct = parseFloat(submission.percentage);
  const gradeColor = pct >= 80 ? "text-emerald-400" : pct >= 60 ? "text-amber-400" : "text-rose-400";
  const gradeBg = pct >= 80 ? "bg-emerald-500/15 border-emerald-500/30" : pct >= 60 ? "bg-amber-500/15 border-amber-500/30" : "bg-rose-500/15 border-rose-500/30";
  const grade = pct >= 90 ? "A+" : pct >= 80 ? "A" : pct >= 70 ? "B" : pct >= 60 ? "C" : pct >= 50 ? "D" : "F";

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/tests")} className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="font-display text-2xl font-semibold text-white">Test Result</h1>
          <p className="text-white/40 text-sm mt-0.5">{new Date(submission.submittedAt).toLocaleString()}</p>
        </div>
      </div>

      {/* Score Card */}
      <div className={`card p-8 text-center border ${gradeBg}`}>
        <div className={`text-7xl font-display font-bold ${gradeColor} mb-2`}>{grade}</div>
        <div className="text-4xl font-semibold text-white mb-1">
          {submission.totalMarksObtained} <span className="text-white/30 text-2xl">/ {submission.totalMarks}</span>
        </div>
        <div className={`text-lg font-medium ${gradeColor}`}>{pct}%</div>
        {rank && (
          <div className="mt-4 flex items-center justify-center gap-1 text-sm text-white/50">
            <Trophy size={14} className="text-amber-400" />
            Rank {rank} of {totalStudents} students
          </div>
        )}
        {submission.isAutoSubmitted && (
          <div className="mt-3 text-xs text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-full inline-block">
            ⏱ Auto-submitted (time expired)
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Correct", value: submission.correctCount, icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Incorrect", value: submission.incorrectCount, icon: XCircle, color: "text-rose-400", bg: "bg-rose-500/10" },
          { label: "Unanswered", value: submission.unansweredCount, icon: MinusCircle, color: "text-white/40", bg: "bg-white/5" },
          { label: "Time Taken", value: formatTime(submission.timeTaken), icon: Clock, color: "text-blue-400", bg: "bg-blue-500/10" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-4 text-center">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mx-auto mb-2`}>
              <Icon size={18} className={color} />
            </div>
            <div className="text-xl font-semibold font-display text-white">{value}</div>
            <div className="text-xs text-white/40 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Performance Bar */}
      <div className="card p-5">
        <h2 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
          <BarChart2 size={16} className="text-blue-400" /> Performance Breakdown
        </h2>
        <div className="flex h-4 rounded-full overflow-hidden gap-0.5">
          <div className="bg-emerald-500 transition-all" style={{ width: `${(submission.correctCount / submission.answers.length) * 100}%` }} title={`Correct: ${submission.correctCount}`} />
          <div className="bg-rose-500 transition-all" style={{ width: `${(submission.incorrectCount / submission.answers.length) * 100}%` }} title={`Wrong: ${submission.incorrectCount}`} />
          <div className="bg-white/10 flex-1" title={`Unanswered: ${submission.unansweredCount}`} />
        </div>
        <div className="flex items-center gap-4 mt-2 text-xs text-white/40">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Correct</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />Incorrect</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-white/20 inline-block" />Unanswered</span>
        </div>
      </div>

      {/* Detailed Question Review */}
      <div>
        <h2 className="text-sm font-medium text-white mb-3">Question-wise Review</h2>
        <div className="space-y-2">
          {submission.answers.map((ans, idx) => {
            const q = ans.question;
            const isOpen = expandedQ === idx;
            const statusIcon = !ans.selectedOption
              ? <MinusCircle size={16} className="text-white/30" />
              : ans.isCorrect
              ? <CheckCircle size={16} className="text-emerald-400" />
              : <XCircle size={16} className="text-rose-400" />;

            const statusBg = !ans.selectedOption
              ? "border-white/5"
              : ans.isCorrect
              ? "border-emerald-500/20"
              : "border-rose-500/20";

            return (
              <div key={idx} className={`card border ${statusBg} overflow-hidden`}>
                <button
                  onClick={() => setExpandedQ(isOpen ? null : idx)}
                  className="w-full flex items-start gap-3 p-4 text-left"
                >
                  <span className="flex-shrink-0 mt-0.5">{statusIcon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/80 leading-relaxed line-clamp-2">{q?.questionText}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {q?.topic && <span className="text-xs text-blue-400">{q.topic}</span>}
                      <span className={`text-xs font-medium ${ans.marksAwarded > 0 ? "text-emerald-400" : ans.marksAwarded < 0 ? "text-rose-400" : "text-white/30"}`}>
                        {ans.marksAwarded > 0 ? `+${ans.marksAwarded}` : ans.marksAwarded} marks
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-white/30 flex-shrink-0 flex items-center gap-1 mt-0.5">
                    Q{idx + 1} {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </span>
                </button>

                {isOpen && q && (
                  <div className="px-4 pb-4 space-y-2 border-t border-white/5 pt-3">
                    {q.options?.map((opt) => {
                      const isSelected = ans.selectedOption === opt.label;
                      const isCorrect = q.correctAnswer === opt.label;
                      return (
                        <div key={opt.label} className={`flex items-center gap-2.5 p-2.5 rounded-lg text-sm ${
                          isCorrect
                            ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                            : isSelected && !isCorrect
                            ? "bg-rose-500/10 border border-rose-500/30 text-rose-300"
                            : "bg-white/3 border border-white/5 text-white/40"
                        }`}>
                          <span className={`w-6 h-6 rounded-md flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                            isCorrect ? "bg-emerald-500 text-white" : isSelected ? "bg-rose-500 text-white" : "bg-white/8 text-white/30"
                          }`}>{opt.label}</span>
                          <span className="flex-1">{opt.text}</span>
                          {isCorrect && <span className="text-xs text-emerald-400">✓ Correct</span>}
                          {isSelected && !isCorrect && <span className="text-xs text-rose-400">✗ Your answer</span>}
                        </div>
                      );
                    })}
                    {!ans.selectedOption && (
                      <p className="text-xs text-white/30 italic">You did not answer this question.</p>
                    )}
                    <p className="text-xs text-white/30 mt-2">
                      Correct answer: <span className="text-emerald-400 font-medium">{q.correctAnswer}</span>
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3 pb-6">
        <button onClick={() => navigate("/tests")} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 text-white/60 hover:bg-white/10 text-sm transition-colors">
          <ArrowLeft size={14} /> Back to Tests
        </button>
      </div>
    </div>
  );
}
