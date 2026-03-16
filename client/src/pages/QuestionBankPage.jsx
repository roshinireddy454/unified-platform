import { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Edit2, Trash2, BookOpen, Search, Filter, X, Check } from "lucide-react";
import toast from "react-hot-toast";

const DIFFICULTY_COLORS = {
  Easy: "badge-green",
  Medium: "badge-amber",
  Hard: "text-xs px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400",
};

const BLANK_QUESTION = {
  questionText: "",
  options: [
    { label: "A", text: "" },
    { label: "B", text: "" },
    { label: "C", text: "" },
    { label: "D", text: "" },
  ],
  correctAnswer: "A",
  marks: 1,
  negativeMarks: 0,
  difficultyLevel: "Medium",
  topic: "",
};

export default function QuestionBankPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(BLANK_QUESTION);
  const [search, setSearch] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterDifficulty) params.difficulty = filterDifficulty;
      const { data } = await axios.get("/api/v1/question", { params, withCredentials: true });
      setQuestions(data.questions || []);
    } catch {
      toast.error("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQuestions(); }, [filterDifficulty]);

  const openCreate = () => { setForm(BLANK_QUESTION); setEditingId(null); setShowForm(true); };
  const openEdit = (q) => {
    setForm({
      questionText: q.questionText,
      options: q.options,
      correctAnswer: q.correctAnswer,
      marks: q.marks,
      negativeMarks: q.negativeMarks,
      difficultyLevel: q.difficultyLevel,
      topic: q.topic || "",
    });
    setEditingId(q._id);
    setShowForm(true);
  };

  const handleOptionChange = (index, value) => {
    const opts = [...form.options];
    opts[index] = { ...opts[index], text: value };
    setForm((f) => ({ ...f, options: opts }));
  };

  const handleSave = async () => {
    if (!form.questionText.trim()) return toast.error("Question text is required");
    if (form.options.some((o) => !o.text.trim())) return toast.error("Fill all options");
    try {
      setSaving(true);
      if (editingId) {
        await axios.put(`/api/v1/question/${editingId}`, form, { withCredentials: true });
        toast.success("Question updated");
      } else {
        await axios.post("/api/v1/question", form, { withCredentials: true });
        toast.success("Question created");
      }
      setShowForm(false);
      fetchQuestions();
    } catch {
      toast.error("Failed to save question");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this question?")) return;
    try {
      await axios.delete(`/api/v1/question/${id}`, { withCredentials: true });
      toast.success("Question deleted");
      setQuestions((q) => q.filter((x) => x._id !== id));
    } catch {
      toast.error("Failed to delete question");
    }
  };

  const filtered = questions.filter(
    (q) =>
      q.questionText.toLowerCase().includes(search.toLowerCase()) ||
      (q.topic || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-white">Question Bank</h1>
          <p className="text-white/40 text-sm mt-1">Create and manage reusable questions for your tests</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={15} /> New Question
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions or topics..."
            className="input pl-9 w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-white/30" />
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="input text-sm"
          >
            <option value="">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
        <span className="text-white/30 text-sm">{filtered.length} questions</span>
      </div>

      {/* Question List */}
      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-xl shimmer" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 flex flex-col items-center text-center">
          <BookOpen size={40} className="text-white/15 mb-3" />
          <p className="text-white/40">No questions yet. Create your first question!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((q, idx) => (
            <div key={q._id} className="card p-5 hover:border-white/15 transition-all">
              <div className="flex items-start gap-4">
                <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/30 text-sm flex-shrink-0">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium leading-relaxed">{q.questionText}</p>
                  <div className="mt-2 grid grid-cols-2 gap-1.5">
                    {q.options.map((opt) => (
                      <div key={opt.label}
                        className={`text-xs px-2.5 py-1.5 rounded-lg ${opt.label === q.correctAnswer ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-white/3 text-white/50"}`}>
                        <span className="font-semibold">{opt.label}.</span> {opt.text}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {q.topic && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400">{q.topic}</span>}
                    <span className={DIFFICULTY_COLORS[q.difficultyLevel] || "badge-blue"}>{q.difficultyLevel}</span>
                    <span className="text-xs text-white/30">{q.marks} mark{q.marks !== 1 ? "s" : ""}</span>
                    {q.negativeMarks > 0 && <span className="text-xs text-rose-400">-{q.negativeMarks} neg</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => openEdit(q)} className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(q._id)} className="p-2 rounded-lg hover:bg-rose-500/15 text-white/40 hover:text-rose-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="font-display text-lg font-semibold text-white">
                {editingId ? "Edit Question" : "New Question"}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-white/40 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              {/* Question Text */}
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Question Text *</label>
                <textarea
                  value={form.questionText}
                  onChange={(e) => setForm((f) => ({ ...f, questionText: e.target.value }))}
                  placeholder="Enter your question..."
                  rows={3}
                  className="input w-full resize-none"
                />
              </div>

              {/* Options */}
              <div>
                <label className="text-xs text-white/50 mb-2 block">Options * (click a label to mark correct)</label>
                <div className="space-y-2">
                  {form.options.map((opt, idx) => (
                    <div key={opt.label} className="flex items-center gap-2">
                      <button
                        onClick={() => setForm((f) => ({ ...f, correctAnswer: opt.label }))}
                        className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-sm font-bold transition-all ${form.correctAnswer === opt.label ? "bg-emerald-500 text-white" : "bg-white/5 text-white/40 hover:bg-white/10"}`}
                      >
                        {form.correctAnswer === opt.label ? <Check size={14} /> : opt.label}
                      </button>
                      <input
                        value={opt.text}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        placeholder={`Option ${opt.label}`}
                        className="input flex-1"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-white/30 mt-1.5">Click a letter button to mark as correct answer</p>
              </div>

              {/* Marks & Meta */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/50 mb-1.5 block">Marks</label>
                  <input type="number" min={1} value={form.marks} onChange={(e) => setForm((f) => ({ ...f, marks: +e.target.value }))} className="input w-full" />
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1.5 block">Negative Marks</label>
                  <input type="number" min={0} step={0.25} value={form.negativeMarks} onChange={(e) => setForm((f) => ({ ...f, negativeMarks: +e.target.value }))} className="input w-full" />
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1.5 block">Difficulty</label>
                  <select value={form.difficultyLevel} onChange={(e) => setForm((f) => ({ ...f, difficultyLevel: e.target.value }))} className="input w-full">
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1.5 block">Topic / Tag</label>
                  <input value={form.topic} onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))} placeholder="e.g. Chapter 3, Arrays" className="input w-full" />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-white/5 flex gap-3 justify-end">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl bg-white/5 text-white/60 hover:bg-white/10 text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">
                {saving ? "Saving..." : editingId ? "Update Question" : "Create Question"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
