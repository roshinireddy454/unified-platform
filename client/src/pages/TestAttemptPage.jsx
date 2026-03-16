import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Clock, ChevronLeft, ChevronRight, Send, AlertTriangle, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function TestAttemptPage() {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({}); // { questionId: selectedOption }
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0); // seconds
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const startTimeRef = useRef(Date.now());
  const timerRef = useRef(null);

  useEffect(() => {
    axios.get(`/api/v1/test/${testId}/start`, { withCredentials: true })
      .then(({ data }) => {
        setTest(data.test);
        setTimeLeft(data.test.durationSeconds);
        startTimeRef.current = Date.now();
      })
      .catch((e) => {
        toast.error(e?.response?.data?.message || "Cannot start test");
        navigate("/tests");
      })
      .finally(() => setLoading(false));
  }, [testId]);

  const handleSubmit = useCallback(async (isAuto = false) => {
    if (submitting || submitted) return;
    setSubmitting(true);
    const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const answersArray = Object.entries(answers).map(([questionId, selectedOption]) => ({
      questionId,
      selectedOption,
    }));
    try {
      await axios.post(
        `/api/v1/test/${testId}/submit`,
        { answers: answersArray, timeTaken, isAutoSubmitted: isAuto },
        { withCredentials: true }
      );
      setSubmitted(true);
      toast.success(isAuto ? "Time up! Test auto-submitted." : "Test submitted successfully!");
      setTimeout(() => navigate(`/test/${testId}/result`), 1500);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to submit");
      setSubmitting(false);
    }
  }, [answers, testId, submitting, submitted, navigate]);

  // Countdown timer
  useEffect(() => {
    if (!test) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [test, handleSubmit]);

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const timerColor = timeLeft < 60 ? "text-rose-400" : timeLeft < 300 ? "text-amber-400" : "text-emerald-400";
  const timerBg = timeLeft < 60 ? "bg-rose-500/15 border-rose-500/30" : timeLeft < 300 ? "bg-amber-500/15 border-amber-500/30" : "bg-emerald-500/15 border-emerald-500/30";

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = test?.questions?.length || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin mx-auto" />
          <p className="text-white/40 text-sm">Loading test...</p>
        </div>
      </div>
    );
  }

  if (!test) return null;

  const currentQuestion = test.questions[currentIdx];

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-white/5 px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-white font-medium text-sm truncate">{test.title}</h1>
          <p className="text-white/30 text-xs">{answeredCount}/{totalQuestions} answered</p>
        </div>

        {/* Timer */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono font-bold ${timerBg} ${timerColor}`}>
          <Clock size={15} className={timeLeft < 60 ? "animate-pulse" : ""} />
          {formatTime(timeLeft)}
        </div>

        <button
          onClick={() => setShowConfirm(true)}
          disabled={submitting || submitted}
          className="btn-primary text-sm flex items-center gap-2"
        >
          <Send size={14} /> Submit
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Question palette (sidebar on desktop) */}
        <aside className="hidden lg:flex flex-col w-56 bg-slate-900 border-r border-white/5 p-4 overflow-y-auto">
          <p className="text-xs text-white/30 mb-3 font-medium uppercase tracking-wide">Questions</p>
          <div className="grid grid-cols-5 gap-1.5">
            {test.questions.map((q, i) => {
              const isAnswered = !!answers[q._id];
              const isCurrent = i === currentIdx;
              return (
                <button
                  key={q._id}
                  onClick={() => setCurrentIdx(i)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                    isCurrent
                      ? "bg-blue-500 text-white ring-2 ring-blue-500/40"
                      : isAnswered
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-white/5 text-white/40 hover:bg-white/10"
                  }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          <div className="mt-6 space-y-2 text-xs">
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-emerald-500/20 border border-emerald-500/30" /><span className="text-white/40">Answered</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-white/5" /><span className="text-white/40">Not answered</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-blue-500" /><span className="text-white/40">Current</span></div>
          </div>

          <div className="mt-auto pt-4 border-t border-white/5">
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${(answeredCount / totalQuestions) * 100}%` }} />
            </div>
            <p className="text-xs text-white/30 mt-1">{Math.round((answeredCount / totalQuestions) * 100)}% complete</p>
          </div>
        </aside>

        {/* Main question area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 flex flex-col items-center">
          <div className="w-full max-w-2xl space-y-6">
            {/* Instructions (first question only) */}
            {currentIdx === 0 && test.instructions && (
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <p className="text-xs text-blue-400 font-medium mb-1">Instructions</p>
                <p className="text-sm text-blue-300/80 whitespace-pre-line">{test.instructions}</p>
              </div>
            )}

            {/* Question card */}
            <div className="card p-6">
              <div className="flex items-start gap-3 mb-6">
                <span className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {currentIdx + 1}
                </span>
                <div className="flex-1">
                  <p className="text-white leading-relaxed">{currentQuestion.questionText}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {currentQuestion.topic && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400">{currentQuestion.topic}</span>}
                    <span className="text-xs text-white/30">{currentQuestion.marks} mark{currentQuestion.marks !== 1 ? "s" : ""}</span>
                    {currentQuestion.negativeMarks > 0 && (
                      <span className="text-xs text-rose-400">-{currentQuestion.negativeMarks} for wrong</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((opt) => {
                  const isSelected = answers[currentQuestion._id] === opt.label;
                  return (
                    <button
                      key={opt.label}
                      onClick={() => setAnswers((prev) => ({ ...prev, [currentQuestion._id]: opt.label }))}
                      className={`w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "border-blue-500/60 bg-blue-500/10 text-white"
                          : "border-white/8 bg-white/2 text-white/70 hover:border-white/20 hover:bg-white/5"
                      }`}
                    >
                      <span className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-bold transition-all ${
                        isSelected ? "bg-blue-500 text-white" : "bg-white/8 text-white/40"
                      }`}>
                        {opt.label}
                      </span>
                      <span className="text-sm">{opt.text}</span>
                      {isSelected && <CheckCircle size={16} className="ml-auto text-blue-400 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Clear answer */}
              {answers[currentQuestion._id] && (
                <button
                  onClick={() => setAnswers((prev) => { const n = { ...prev }; delete n[currentQuestion._id]; return n; })}
                  className="mt-3 text-xs text-white/30 hover:text-rose-400 transition-colors"
                >
                  Clear selection
                </button>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                disabled={currentIdx === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-white/50 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm"
              >
                <ChevronLeft size={16} /> Previous
              </button>

              {/* Mobile question dots */}
              <div className="flex gap-1 lg:hidden">
                {test.questions.slice(Math.max(0, currentIdx - 2), currentIdx + 3).map((q, i) => {
                  const actualIdx = Math.max(0, currentIdx - 2) + i;
                  return (
                    <button key={q._id} onClick={() => setCurrentIdx(actualIdx)}
                      className={`w-2 h-2 rounded-full transition-all ${actualIdx === currentIdx ? "bg-blue-500 w-4" : answers[q._id] ? "bg-emerald-500/50" : "bg-white/20"}`} />
                  );
                })}
              </div>

              {currentIdx < totalQuestions - 1 ? (
                <button
                  onClick={() => setCurrentIdx((i) => i + 1)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-400 transition-all text-sm"
                >
                  Next <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  onClick={() => setShowConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-400 transition-all text-sm"
                >
                  Finish <Send size={14} />
                </button>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Submit Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl border border-white/10 p-6 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
                <AlertTriangle size={20} className="text-amber-400" />
              </div>
              <h2 className="font-semibold text-white">Submit Test?</h2>
            </div>
            <div className="space-y-2 mb-5 text-sm text-white/50">
              <p>✅ Answered: <span className="text-white">{answeredCount}</span></p>
              <p>⬜ Unanswered: <span className="text-white">{totalQuestions - answeredCount}</span></p>
              <p className={timerColor}>⏱ Time remaining: {formatTime(timeLeft)}</p>
            </div>
            <p className="text-xs text-white/30 mb-5">Once submitted, you cannot make changes.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="flex-1 px-4 py-2 rounded-xl bg-white/5 text-white/60 text-sm hover:bg-white/10">
                Cancel
              </button>
              <button
                onClick={() => { setShowConfirm(false); handleSubmit(false); }}
                disabled={submitting}
                className="flex-1 btn-primary text-sm"
              >
                {submitting ? "Submitting..." : "Submit Now"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submitted overlay */}
      {submitted && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
              <CheckCircle size={32} className="text-emerald-400" />
            </div>
            <p className="text-white font-semibold text-lg">Test Submitted!</p>
            <p className="text-white/40 text-sm">Redirecting to results...</p>
          </div>
        </div>
      )}
    </div>
  );
}
