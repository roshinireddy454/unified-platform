import { useEffect, useState } from "react";
import axios from "axios";
import {
  Plus, ClipboardList, Edit2, Trash2, BarChart2, Eye, EyeOff,
  Clock, Calendar, BookOpen, X, ChevronDown, Check, Search
} from "lucide-react";
import toast from "react-hot-toast";

const BLANK_TEST = {
  courseId: "",
  title: "",
  description: "",
  instructions: "",
  duration: 30,
  startTime: "",
  endTime: "",
  negativeMarkingEnabled: false,
  attemptsAllowed: 1,
  randomizeQuestions: false,
  randomizeOptions: false,
};

function TestFormModal({ courses, initial, onClose, onSaved }) {
  const [form, setForm] = useState(initial || BLANK_TEST);
  const [saving, setSaving] = useState(false);

  const isEdit = !!initial?._id;

  const handleSave = async () => {
    if (!form.courseId || !form.title || !form.startTime || !form.endTime) {
      return toast.error("Course, title, start and end time are required.");
    }
    try {
      setSaving(true);
      if (isEdit) {
        await axios.put(`/api/v1/test/${initial._id}`, form, { withCredentials: true });
        toast.success("Test updated");
      } else {
        await axios.post("/api/v1/test", form, { withCredentials: true });
        toast.success("Test created");
      }
      onSaved();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to save test");
    } finally {
      setSaving(false);
    }
  };

  const f = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="font-display text-lg font-semibold text-white">{isEdit ? "Edit Test" : "Create New Test"}</h2>
          <button onClick={onClose}><X size={20} className="text-white/40" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs text-white/50 mb-1.5 block">Course *</label>
            <select value={form.courseId} onChange={f("courseId")} className="input w-full" disabled={isEdit}>
              <option value="">Select a course</option>
              {courses.map((c) => <option key={c._id} value={c._id}>{c.courseTitle}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1.5 block">Test Title *</label>
            <input value={form.title} onChange={f("title")} placeholder="e.g. Mid-Term Exam" className="input w-full" />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1.5 block">Description</label>
            <textarea value={form.description} onChange={f("description")} rows={2} className="input w-full resize-none" placeholder="Brief description..." />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1.5 block">Instructions for Students</label>
            <textarea value={form.instructions} onChange={f("instructions")} rows={3} className="input w-full resize-none" placeholder="e.g. Read all questions carefully before answering..." />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-white/50 mb-1.5 block">Duration (minutes) *</label>
              <input type="number" min={1} value={form.duration} onChange={f("duration")} className="input w-full" />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1.5 block">Start Time *</label>
              <input type="datetime-local" value={form.startTime} onChange={f("startTime")} className="input w-full" />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1.5 block">End Time *</label>
              <input type="datetime-local" value={form.endTime} onChange={f("endTime")} className="input w-full" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/50 mb-1.5 block">Attempts Allowed</label>
              <input type="number" min={1} value={form.attemptsAllowed} onChange={f("attemptsAllowed")} className="input w-full" />
            </div>
            <div className="flex flex-col justify-end gap-2">
              {[
                ["negativeMarkingEnabled", "Enable Negative Marking"],
                ["randomizeQuestions", "Randomize Questions"],
                ["randomizeOptions", "Randomize Options"],
              ].map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form[key]} onChange={f(key)} className="w-4 h-4 rounded accent-blue-500" />
                  <span className="text-sm text-white/60">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-white/5 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-white/5 text-white/60 text-sm">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">
            {saving ? "Saving..." : isEdit ? "Update Test" : "Create Test"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AddQuestionsModal({ test, onClose, onSaved }) {
  const [bankQuestions, setBankQuestions] = useState([]);
  const [selected, setSelected] = useState(
    (test.questions || []).map((q) => ({
      questionId: q.question?._id || q.question,
      marks: q.marks,
      negativeMarks: q.negativeMarks,
    }))
  );
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios.get("/api/v1/question", { withCredentials: true })
      .then(({ data }) => setBankQuestions(data.questions || []))
      .catch(() => toast.error("Failed to load question bank"));
  }, []);

  const toggle = (q) => {
    setSelected((prev) => {
      const exists = prev.find((s) => s.questionId === q._id);
      if (exists) return prev.filter((s) => s.questionId !== q._id);
      return [...prev, { questionId: q._id, marks: q.marks, negativeMarks: q.negativeMarks }];
    });
  };

  const updateMarks = (questionId, key, value) => {
    setSelected((prev) => prev.map((s) => s.questionId === questionId ? { ...s, [key]: +value } : s));
  };

  const isSelected = (id) => selected.some((s) => s.questionId === id);

  const handleSave = async () => {
    try {
      setSaving(true);
      await axios.post(`/api/v1/test/${test._id}/questions`, { questions: selected }, { withCredentials: true });
      toast.success("Questions saved to test");
      onSaved();
    } catch {
      toast.error("Failed to save questions");
    } finally {
      setSaving(false);
    }
  };

  const filtered = bankQuestions.filter((q) =>
    q.questionText.toLowerCase().includes(search.toLowerCase()) ||
    (q.topic || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl border border-white/10 w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div>
            <h2 className="font-display text-lg font-semibold text-white">Add Questions — {test.title}</h2>
            <p className="text-xs text-white/40 mt-0.5">{selected.length} selected · Total: {selected.reduce((a, s) => a + s.marks, 0)} marks</p>
          </div>
          <button onClick={onClose}><X size={20} className="text-white/40" /></button>
        </div>
        <div className="p-4 border-b border-white/5">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search questions..." className="input pl-9 w-full" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filtered.length === 0 ? (
            <p className="text-center text-white/30 py-10">No questions in bank. Create some first!</p>
          ) : filtered.map((q) => {
            const sel = selected.find((s) => s.questionId === q._id);
            return (
              <div key={q._id}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${isSelected(q._id) ? "border-blue-500/50 bg-blue-500/5" : "border-white/5 bg-white/2 hover:border-white/10"}`}
                onClick={() => toggle(q)}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${isSelected(q._id) ? "bg-blue-500" : "border border-white/20"}`}>
                    {isSelected(q._id) && <Check size={11} className="text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white">{q.questionText}</p>
                    <div className="flex gap-2 mt-1">
                      {q.topic && <span className="text-xs text-blue-400">{q.topic}</span>}
                      <span className="text-xs text-white/30">{q.difficultyLevel}</span>
                      <span className="text-xs text-white/30">{q.marks} mark{q.marks !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                  {sel && (
                    <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      <div>
                        <label className="text-xs text-white/30 block">Marks</label>
                        <input type="number" min={0} value={sel.marks} onChange={(e) => updateMarks(q._id, "marks", e.target.value)}
                          className="input w-16 text-xs py-1" />
                      </div>
                      <div>
                        <label className="text-xs text-white/30 block">Neg</label>
                        <input type="number" min={0} step={0.25} value={sel.negativeMarks} onChange={(e) => updateMarks(q._id, "negativeMarks", e.target.value)}
                          className="input w-16 text-xs py-1" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="p-4 border-t border-white/5 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-white/5 text-white/60 text-sm">Cancel</button>
          <button onClick={handleSave} disabled={saving || selected.length === 0} className="btn-primary text-sm">
            {saving ? "Saving..." : `Save ${selected.length} Questions`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TestManagerPage() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [addingQuestionsTo, setAddingQuestionsTo] = useState(null);
  const [analyticsTest, setAnalyticsTest] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    axios.get("/api/v1/course", { withCredentials: true })
      .then(({ data }) => {
        setCourses(data.courses || []);
        if (data.courses?.length > 0) setSelectedCourse(data.courses[0]._id);
      });
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;
    setLoading(true);
    axios.get(`/api/v1/test/instructor/course/${selectedCourse}`, { withCredentials: true })
      .then(({ data }) => setTests(data.tests || []))
      .catch(() => toast.error("Failed to fetch tests"))
      .finally(() => setLoading(false));
  }, [selectedCourse]);

  const refreshTests = () => {
    setShowCreateForm(false);
    setEditingTest(null);
    setAddingQuestionsTo(null);
    if (!selectedCourse) return;
    axios.get(`/api/v1/test/instructor/course/${selectedCourse}`, { withCredentials: true })
      .then(({ data }) => setTests(data.tests || []));
  };

  const togglePublish = async (test) => {
    try {
      const { data } = await axios.patch(`/api/v1/test/${test._id}/publish`, {}, { withCredentials: true });
      toast.success(data.message);
      setTests((prev) => prev.map((t) => t._id === test._id ? { ...t, isPublished: data.isPublished } : t));
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to toggle publish");
    }
  };

  const deleteTest = async (id) => {
    if (!confirm("Delete this test and all its submissions?")) return;
    try {
      await axios.delete(`/api/v1/test/${id}`, { withCredentials: true });
      toast.success("Test deleted");
      setTests((prev) => prev.filter((t) => t._id !== id));
    } catch {
      toast.error("Failed to delete test");
    }
  };

  const viewAnalytics = async (test) => {
    try {
      const { data } = await axios.get(`/api/v1/test/${test._id}/analytics`, { withCredentials: true });
      setAnalytics(data.analytics);
      setAnalyticsTest(test);
    } catch {
      toast.error("Failed to load analytics");
    }
  };

  const statusBadge = (test) => {
    const now = new Date();
    if (!test.isPublished) return <span className="badge-amber">Draft</span>;
    if (new Date(test.startTime) > now) return <span className="badge-blue">Upcoming</span>;
    if (new Date(test.endTime) < now) return <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/30">Expired</span>;
    return <span className="badge-green">Live</span>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-white">Test Manager</h1>
          <p className="text-white/40 text-sm mt-1">Create, schedule and manage tests for your courses</p>
        </div>
        <button onClick={() => setShowCreateForm(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={15} /> Create Test
        </button>
      </div>

      {/* Course selector */}
      <div className="card p-4 flex items-center gap-3">
        <BookOpen size={16} className="text-white/30" />
        <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="input flex-1 max-w-xs">
          {courses.map((c) => <option key={c._id} value={c._id}>{c.courseTitle}</option>)}
        </select>
        <span className="text-white/30 text-sm">{tests.length} test{tests.length !== 1 ? "s" : ""}</span>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-24 shimmer rounded-xl" />)}</div>
      ) : tests.length === 0 ? (
        <div className="card p-12 flex flex-col items-center text-center">
          <ClipboardList size={40} className="text-white/15 mb-3" />
          <p className="text-white/40 mb-3">No tests for this course yet.</p>
          <button onClick={() => setShowCreateForm(true)} className="btn-primary text-sm flex items-center gap-2">
            <Plus size={14} /> Create First Test
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {tests.map((test) => (
            <div key={test._id} className="card p-5 hover:border-white/15 transition-all">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium text-white">{test.title}</h3>
                    {statusBadge(test)}
                  </div>
                  {test.description && <p className="text-sm text-white/40 mt-1 truncate">{test.description}</p>}
                  <div className="flex flex-wrap items-center gap-4 mt-2">
                    <span className="flex items-center gap-1 text-xs text-white/30"><Clock size={11} />{test.duration} min</span>
                    <span className="flex items-center gap-1 text-xs text-white/30"><Calendar size={11} />{new Date(test.startTime).toLocaleString()}</span>
                    <span className="text-xs text-white/30">{test.questions?.length || 0} questions · {test.totalMarks} marks</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button onClick={() => setAddingQuestionsTo(test)}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 transition-colors">
                    <Plus size={12} /> Questions
                  </button>
                  <button onClick={() => viewAnalytics(test)}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 transition-colors">
                    <BarChart2 size={12} /> Analytics
                  </button>
                  <button onClick={() => togglePublish(test)}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors ${test.isPublished ? "bg-emerald-500/15 text-emerald-400 hover:bg-rose-500/15 hover:text-rose-400" : "bg-white/5 text-white/50 hover:bg-emerald-500/15 hover:text-emerald-400"}`}>
                    {test.isPublished ? <><EyeOff size={12} />Unpublish</> : <><Eye size={12} />Publish</>}
                  </button>
                  <button onClick={() => setEditingTest(test)}
                    className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => deleteTest(test._id)}
                    className="p-2 rounded-lg hover:bg-rose-500/15 text-white/40 hover:text-rose-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(showCreateForm || editingTest) && (
        <TestFormModal
          courses={courses}
          initial={editingTest ? { ...editingTest, courseId: editingTest.course } : null}
          onClose={() => { setShowCreateForm(false); setEditingTest(null); }}
          onSaved={refreshTests}
        />
      )}

      {addingQuestionsTo && (
        <AddQuestionsModal
          test={addingQuestionsTo}
          onClose={() => setAddingQuestionsTo(null)}
          onSaved={refreshTests}
        />
      )}

      {/* Analytics Modal */}
      {analyticsTest && analytics && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl border border-white/10 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="font-display text-lg font-semibold text-white">Analytics — {analyticsTest.title}</h2>
              <button onClick={() => { setAnalyticsTest(null); setAnalytics(null); }}><X size={20} className="text-white/40" /></button>
            </div>
            <div className="p-6 space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Attempted", value: analytics.totalAttempted },
                  { label: "Avg Score", value: `${analytics.averageScore}/${analytics.totalMarks}` },
                  { label: "Highest", value: analytics.highestScore },
                  { label: "Lowest", value: analytics.lowestScore },
                ].map(({ label, value }) => (
                  <div key={label} className="card p-4 text-center">
                    <div className="text-xl font-semibold font-display text-white">{value}</div>
                    <div className="text-xs text-white/40 mt-1">{label}</div>
                  </div>
                ))}
              </div>

              {/* Question-wise */}
              <div>
                <h3 className="text-sm font-medium text-white mb-3">Question-wise Analysis</h3>
                <div className="space-y-2">
                  {analytics.questionStats?.map((qs, i) => (
                    <div key={qs.questionId} className="p-3 rounded-xl bg-white/3 border border-white/5">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs text-white/70 flex-1 truncate"><span className="text-white/30 mr-2">Q{i + 1}.</span>{qs.questionText}</p>
                        <span className="text-xs text-white/30 flex-shrink-0">{qs.correctCount}/{qs.totalAttempted} correct</span>
                      </div>
                      <div className="mt-2 h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${qs.correctPercentage}%` }} />
                      </div>
                      <p className="text-xs text-emerald-400 mt-1">{qs.correctPercentage}% answered correctly</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Students */}
              {analytics.submissions?.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-white mb-3">Leaderboard</h3>
                  <div className="space-y-2">
                    {analytics.submissions.slice(0, 10).map((sub, i) => (
                      <div key={sub._id} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/5">
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-amber-500/20 text-amber-400" : i === 1 ? "bg-slate-400/20 text-slate-300" : i === 2 ? "bg-orange-700/20 text-orange-400" : "bg-white/5 text-white/30"}`}>
                          {i + 1}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm text-white">{sub.student?.name}</p>
                          <p className="text-xs text-white/30">{sub.student?.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-white">{sub.totalMarksObtained}/{analytics.totalMarks}</p>
                          <p className="text-xs text-white/30">{sub.percentage}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
