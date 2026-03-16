import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";
import {
  CheckCircle2, Circle, Plus, Trash2, Edit3, X, Check,
  Flag, Calendar, ChevronDown, RotateCcw, ListTodo,
  AlertTriangle, Clock, Layers, SlidersHorizontal,
  RefreshCw, BookOpen, Video, ClipboardList,
} from "lucide-react";

// ── Constants ─────────────────────────────────────────────────
const PRIORITY_META = {
  high:   { label: "High",   color: "text-rose-400",    bg: "bg-rose-500/15",    border: "border-rose-500/30",    dot: "bg-rose-400"    },
  medium: { label: "Medium", color: "text-amber-400",   bg: "bg-amber-500/15",   border: "border-amber-500/30",   dot: "bg-amber-400"   },
  low:    { label: "Low",    color: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/30", dot: "bg-emerald-400" },
};

const SOURCE_META = {
  meeting: { icon: Video,         label: "Live Class",   color: "text-azure-400"  },
  test:    { icon: ClipboardList, label: "Test",         color: "text-violet-400" },
  course:  { icon: BookOpen,      label: "Course",       color: "text-teal-400"   },
  manual:  { icon: ListTodo,      label: "Personal",     color: "text-white/40"   },
};

const BLANK_FORM = {
  title:       "",
  description: "",
  dueDate:     "",
  priority:    "medium",
};

// ── Helpers ───────────────────────────────────────────────────
function formatDue(date) {
  if (!date) return null;
  const d   = new Date(date);
  const now = new Date();
  const diff = Math.ceil((d - now) / 86400000);
  if (diff < 0)  return { text: `${Math.abs(diff)}d overdue`, cls: "text-rose-400" };
  if (diff === 0) return { text: "Due today",                cls: "text-amber-400" };
  if (diff === 1) return { text: "Due tomorrow",             cls: "text-amber-400" };
  if (diff <= 7) return { text: `Due in ${diff}d`,           cls: "text-white/50"  };
  return { text: d.toLocaleDateString([], { month: "short", day: "numeric" }), cls: "text-white/35" };
}

function toInputDate(isoString) {
  if (!isoString) return "";
  return new Date(isoString).toISOString().slice(0, 16);
}

// ── Task Form Modal ───────────────────────────────────────────
function TaskFormModal({ initial, onClose, onSaved }) {
  const [form,   setForm]   = useState(initial ? {
    title:       initial.title,
    description: initial.description || "",
    dueDate:     toInputDate(initial.dueDate),
    priority:    initial.priority,
  } : BLANK_FORM);
  const [saving, setSaving] = useState(false);

  const f = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleSave = async () => {
    if (!form.title.trim()) return toast.error("Task title is required.");
    setSaving(true);
    try {
      const payload = {
        title:       form.title.trim(),
        description: form.description.trim(),
        dueDate:     form.dueDate || null,
        priority:    form.priority,
      };
      if (initial) {
        const { data } = await axios.put(`/api/v1/tasks/${initial._id}`, payload, { withCredentials: true });
        onSaved(data.task, "updated");
      } else {
        const { data } = await axios.post("/api/v1/tasks", payload, { withCredentials: true });
        onSaved(data.task, "created");
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to save task.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl border border-white/10 w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="font-display text-lg font-semibold text-white">
            {initial ? "Edit Task" : "New Task"}
          </h2>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="label">Title *</label>
            <input
              value={form.title}
              onChange={f("title")}
              placeholder="e.g. Read Chapter 5, Submit assignment…"
              className="input"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
          </div>

          <div>
            <label className="label">Description <span className="text-white/20">(optional)</span></label>
            <textarea
              value={form.description}
              onChange={f("description")}
              placeholder="Any extra notes…"
              rows={2}
              className="input resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Due Date</label>
              <input
                type="datetime-local"
                value={form.dueDate}
                onChange={f("dueDate")}
                className="input text-sm"
              />
            </div>
            <div>
              <label className="label">Priority</label>
              <select value={form.priority} onChange={f("priority")} className="input text-sm">
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex gap-3 justify-end">
          <button onClick={onClose} className="btn-secondary text-sm px-4 py-2">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} className="btn-primary text-sm px-4 py-2 flex items-center gap-2">
            {saving
              ? <><RefreshCw size={13} className="animate-spin" /> Saving…</>
              : <><Check size={13} /> {initial ? "Update" : "Create Task"}</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Single Task Row ───────────────────────────────────────────
function TaskRow({ task, onToggle, onEdit, onDelete }) {
  const pm      = PRIORITY_META[task.priority] || PRIORITY_META.medium;
  const sm      = SOURCE_META[task.source]     || SOURCE_META.manual;
  const SourceIcon = sm.icon;
  const due     = task.dueDate ? formatDue(task.dueDate) : null;
  const isAuto  = task.source !== "manual";
  const isDone  = task.status === "completed";

  return (
    <div className={`group flex items-start gap-3 p-4 rounded-xl border transition-all duration-200 ${
      isDone
        ? "border-white/4 bg-white/1 opacity-60"
        : "border-white/7 bg-white/2 hover:border-white/12 hover:bg-white/4"
    }`}>

      {/* Checkbox */}
      <button
        onClick={() => onToggle(task._id)}
        className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
          isDone
            ? "bg-emerald-500 border-emerald-500"
            : "border-white/30 hover:border-emerald-400"
        }`}
      >
        {isDone && <Check size={11} className="text-white" strokeWidth={3} />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-sm font-medium ${isDone ? "line-through text-white/30" : "text-white"}`}>
            {task.title}
          </span>
          {/* Priority badge */}
          <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full ${pm.bg} ${pm.color} border ${pm.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${pm.dot}`} />
            {pm.label}
          </span>
          {/* Source badge for auto-tasks */}
          {isAuto && (
            <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 ${sm.color}`}>
              <SourceIcon size={9} /> {sm.label}
            </span>
          )}
        </div>

        {task.description && (
          <p className="text-xs text-white/35 mt-0.5 truncate">{task.description}</p>
        )}

        {due && (
          <div className={`flex items-center gap-1 mt-1 text-xs ${due.cls}`}>
            <Clock size={10} /> {due.text}
          </div>
        )}
      </div>

      {/* Actions — reveal on hover, always shown on mobile */}
      <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {!isAuto && (
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-white transition-all"
            title="Edit task"
          >
            <Edit3 size={13} />
          </button>
        )}
        <button
          onClick={() => onDelete(task._id)}
          className="p-1.5 rounded-lg hover:bg-rose-500/15 text-white/30 hover:text-rose-400 transition-all"
          title="Delete task"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

// ── Stats bar ─────────────────────────────────────────────────
function StatsBar({ tasks }) {
  const total     = tasks.length;
  const done      = tasks.filter((t) => t.status === "completed").length;
  const overdue   = tasks.filter((t) => t.status === "pending" && t.dueDate && new Date(t.dueDate) < new Date()).length;
  const pct       = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <div className="card p-4 flex flex-wrap items-center gap-6">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-white/40">Overall progress</span>
          <span className="text-xs font-semibold text-white">{pct}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-5 flex-shrink-0">
        <div className="text-center">
          <div className="text-lg font-semibold font-display text-white">{total}</div>
          <div className="text-[10px] text-white/30 uppercase tracking-wide">Total</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold font-display text-emerald-400">{done}</div>
          <div className="text-[10px] text-white/30 uppercase tracking-wide">Done</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold font-display text-white/60">{total - done}</div>
          <div className="text-[10px] text-white/30 uppercase tracking-wide">Pending</div>
        </div>
        {overdue > 0 && (
          <div className="text-center">
            <div className="text-lg font-semibold font-display text-rose-400">{overdue}</div>
            <div className="text-[10px] text-white/30 uppercase tracking-wide">Overdue</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function TodoPage() {
  const { user } = useAuth();

  const [tasks,        setTasks]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [syncing,      setSyncing]      = useState(false);
  const [showForm,     setShowForm]     = useState(false);
  const [editingTask,  setEditingTask]  = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");    // all | pending | completed
  const [filterPriority, setFilterPriority] = useState("all");
  const [sortBy,       setSortBy]       = useState("dueDate");
  const [sortOrder,    setSortOrder]    = useState("asc");
  const [showFilters,  setShowFilters]  = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);   // taskId to confirm

  // ── Fetch ─────────────────────────────────────────────────
  const fetchTasks = useCallback(async () => {
    try {
      const params = { sort: sortBy, order: sortOrder };
      if (filterStatus   !== "all") params.status   = filterStatus;
      if (filterPriority !== "all") params.priority = filterPriority;
      const { data } = await axios.get("/api/v1/tasks", { params, withCredentials: true });
      setTasks(data.tasks || []);
    } catch {
      toast.error("Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterPriority, sortBy, sortOrder]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // ── Sync LMS tasks on mount ───────────────────────────────
  useEffect(() => {
    const sync = async () => {
      try {
        await axios.post("/api/v1/tasks/sync-lms", {}, { withCredentials: true });
        // Re-fetch after sync so auto-tasks appear
        fetchTasks();
      } catch {}
    };
    sync();
  }, []); // eslint-disable-line

  // ── Manual sync ───────────────────────────────────────────
  const handleManualSync = async () => {
    setSyncing(true);
    try {
      const { data } = await axios.post("/api/v1/tasks/sync-lms", {}, { withCredentials: true });
      toast.success(data.created > 0 ? `${data.created} new class task${data.created > 1 ? "s" : ""} added!` : "Tasks are up to date.");
      fetchTasks();
    } catch {
      toast.error("Sync failed.");
    } finally {
      setSyncing(false);
    }
  };

  // ── Toggle ────────────────────────────────────────────────
  const handleToggle = async (taskId) => {
    try {
      const { data } = await axios.patch(`/api/v1/tasks/${taskId}/toggle`, {}, { withCredentials: true });
      setTasks((prev) => prev.map((t) => t._id === taskId ? data.task : t));
    } catch { toast.error("Failed to update task."); }
  };

  // ── Form saved ────────────────────────────────────────────
  const handleSaved = (task, action) => {
    if (action === "created") {
      setTasks((prev) => [task, ...prev]);
      toast.success("Task created!");
    } else {
      setTasks((prev) => prev.map((t) => t._id === task._id ? task : t));
      toast.success("Task updated!");
    }
    setShowForm(false);
    setEditingTask(null);
  };

  // ── Delete ────────────────────────────────────────────────
  const handleDelete = async (taskId) => {
    try {
      await axios.delete(`/api/v1/tasks/${taskId}`, { withCredentials: true });
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      setDeleteConfirm(null);
      toast.success("Task deleted.");
    } catch { toast.error("Failed to delete task."); }
  };

  // ── Clear completed ───────────────────────────────────────
  const handleClearCompleted = async () => {
    const count = tasks.filter((t) => t.status === "completed").length;
    if (count === 0) return;
    try {
      await axios.delete("/api/v1/tasks/completed", { withCredentials: true });
      setTasks((prev) => prev.filter((t) => t.status !== "completed"));
      toast.success(`Cleared ${count} completed task${count > 1 ? "s" : ""}.`);
    } catch { toast.error("Failed to clear completed tasks."); }
  };

  // ── Derived lists ─────────────────────────────────────────
  const pendingTasks    = tasks.filter((t) => t.status === "pending");
  const completedTasks  = tasks.filter((t) => t.status === "completed");
  const overdueTasks    = pendingTasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date());

  const visibleTasks =
    filterStatus === "pending"   ? pendingTasks :
    filterStatus === "completed" ? completedTasks :
    tasks;

  const hasFilters = filterStatus !== "all" || filterPriority !== "all";

  return (
    <div className="space-y-5 animate-fade-in max-w-3xl mx-auto">

      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-white flex items-center gap-2">
            <ListTodo size={22} className="text-azure-400" />
            My Tasks
          </h1>
          <p className="text-white/40 text-sm mt-1">Stay on top of your learning goals</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleManualSync}
            disabled={syncing}
            title="Sync upcoming classes from schedule"
            className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl bg-white/5 border border-white/8 text-white/50 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50"
          >
            <RefreshCw size={13} className={syncing ? "animate-spin" : ""} />
            Sync Classes
          </button>
          <button
            onClick={() => { setEditingTask(null); setShowForm(true); }}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus size={15} /> New Task
          </button>
        </div>
      </div>

      {/* ── Overdue alert ─────────────────────────────────── */}
      {overdueTasks.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/25">
          <AlertTriangle size={16} className="text-rose-400 flex-shrink-0" />
          <p className="text-rose-300 text-sm">
            You have <strong>{overdueTasks.length}</strong> overdue task{overdueTasks.length > 1 ? "s" : ""}.
            Address them soon!
          </p>
        </div>
      )}

      {/* ── Stats ─────────────────────────────────────────── */}
      {tasks.length > 0 && <StatsBar tasks={tasks} />}

      {/* ── Filters bar ───────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Status tabs */}
        <div className="flex items-center gap-1 bg-white/4 rounded-xl p-1 border border-white/6">
          {[
            { key: "all",       label: `All (${tasks.length})`           },
            { key: "pending",   label: `Pending (${pendingTasks.length})`  },
            { key: "completed", label: `Done (${completedTasks.length})`   },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilterStatus(key)}
              className={`text-xs px-3 py-1.5 rounded-lg transition-all font-medium ${
                filterStatus === key
                  ? "bg-blue-500 text-white shadow"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Filter / Sort toggle */}
        <button
          onClick={() => setShowFilters((s) => !s)}
          className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border transition-all ${
            showFilters || hasFilters
              ? "bg-blue-500/15 border-blue-500/30 text-blue-400"
              : "bg-white/4 border-white/6 text-white/40 hover:text-white/70"
          }`}
        >
          <SlidersHorizontal size={12} /> Filters
          {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
        </button>

        {/* Clear completed */}
        {completedTasks.length > 0 && (
          <button
            onClick={handleClearCompleted}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border border-white/6 bg-white/4 text-white/40 hover:text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/5 transition-all ml-auto"
          >
            <RotateCcw size={12} /> Clear completed
          </button>
        )}
      </div>

      {/* ── Expanded filter panel ─────────────────────────── */}
      {showFilters && (
        <div className="card p-4 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[140px]">
            <label className="text-xs text-white/40 mb-1.5 block">Priority</label>
            <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="input text-sm py-2">
              <option value="all">All priorities</option>
              <option value="high">🔴 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </select>
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="text-xs text-white/40 mb-1.5 block">Sort by</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input text-sm py-2">
              <option value="dueDate">Due date</option>
              <option value="priority">Priority</option>
              <option value="createdAt">Date created</option>
              <option value="title">Title</option>
            </select>
          </div>
          <div className="flex-1 min-w-[120px]">
            <label className="text-xs text-white/40 mb-1.5 block">Order</label>
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="input text-sm py-2">
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
          {hasFilters && (
            <div className="flex items-end">
              <button
                onClick={() => { setFilterPriority("all"); setFilterStatus("all"); }}
                className="text-xs text-white/30 hover:text-white/60 transition-colors flex items-center gap-1 pb-2"
              >
                <X size={11} /> Clear filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Task List ─────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-16 rounded-xl shimmer" />)}
        </div>
      ) : visibleTasks.length === 0 ? (
        <div className="card p-12 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            {filterStatus === "completed"
              ? <CheckCircle2 size={24} className="text-white/20" />
              : <ListTodo    size={24} className="text-white/20" />}
          </div>
          <p className="text-white/40 text-sm">
            {filterStatus === "completed"
              ? "No completed tasks yet — keep going!"
              : filterStatus === "pending"
              ? "No pending tasks. You're all caught up! 🎉"
              : "No tasks yet. Create your first one!"}
          </p>
          {filterStatus === "all" && (
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary text-sm mt-4 flex items-center gap-2"
            >
              <Plus size={14} /> Add First Task
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {/* Overdue group */}
          {filterStatus !== "completed" && overdueTasks.length > 0 && (
            <>
              <p className="text-xs text-rose-400/80 font-medium uppercase tracking-wide px-1 flex items-center gap-1.5">
                <AlertTriangle size={10} /> Overdue
              </p>
              {overdueTasks.map((task) => (
                <TaskRow
                  key={task._id}
                  task={task}
                  onToggle={handleToggle}
                  onEdit={(t) => { setEditingTask(t); setShowForm(true); }}
                  onDelete={(id) => setDeleteConfirm(id)}
                />
              ))}
              {visibleTasks.filter((t) => !overdueTasks.includes(t)).length > 0 && (
                <p className="text-xs text-white/25 font-medium uppercase tracking-wide px-1 pt-1">Upcoming</p>
              )}
            </>
          )}

          {/* Remaining tasks */}
          {visibleTasks
            .filter((t) => !overdueTasks.includes(t))
            .map((task) => (
              <TaskRow
                key={task._id}
                task={task}
                onToggle={handleToggle}
                onEdit={(t) => { setEditingTask(t); setShowForm(true); }}
                onDelete={(id) => setDeleteConfirm(id)}
              />
            ))
          }
        </div>
      )}

      {/* ── Auto-tasks legend ─────────────────────────────── */}
      {tasks.some((t) => t.source !== "manual") && (
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/2 border border-white/5">
          <RefreshCw size={11} className="text-white/20 flex-shrink-0" />
          <p className="text-xs text-white/25">
            Tasks marked with <Video size={9} className="inline" /> <ClipboardList size={9} className="inline" /> are automatically synced from your schedule and cannot be edited here.
          </p>
        </div>
      )}

      {/* ── Create / Edit Modal ───────────────────────────── */}
      {showForm && (
        <TaskFormModal
          initial={editingTask}
          onClose={() => { setShowForm(false); setEditingTask(null); }}
          onSaved={handleSaved}
        />
      )}

      {/* ── Delete Confirm ────────────────────────────────── */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl border border-white/10 p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 flex items-center justify-center flex-shrink-0">
                <Trash2 size={18} className="text-rose-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Delete Task?</h3>
                <p className="text-white/40 text-xs mt-0.5">This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 rounded-xl bg-white/5 text-white/60 text-sm hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 text-sm transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}