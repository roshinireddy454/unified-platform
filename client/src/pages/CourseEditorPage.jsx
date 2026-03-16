import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  ChevronLeft, Save, Plus, Trash2, Globe, Lock,
  Upload, Video, Pencil, Check, X, Eye, EyeOff,
  Loader, ChevronDown, ChevronUp
} from "lucide-react";

// ─── Lecture Row with inline edit + video upload ──────────────────────────────
function LectureRow({ lecture, index, courseId, onUpdated, onRemove }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(lecture.lectureTitle);
  const [preview, setPreview] = useState(lecture.isPreviewFree ?? false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const saveTitle = async () => {
    if (!title.trim()) return;
    try {
      await axios.post(
        `/api/v1/course/${courseId}/lecture/${lecture._id}`,
        { lectureTitle: title, isPreviewFree: preview, videoInfo: lecture.videoUrl ? { videoUrl: lecture.videoUrl, publicId: lecture.publicId } : undefined },
        { withCredentials: true }
      );
      onUpdated({ ...lecture, lectureTitle: title, isPreviewFree: preview });
      setEditing(false);
      toast.success("Lecture updated");
    } catch {
      toast.error("Failed to update lecture");
    }
  };

  const togglePreview = async () => {
    const newVal = !preview;
    setPreview(newVal);
    try {
      await axios.post(
        `/api/v1/course/${courseId}/lecture/${lecture._id}`,
        { lectureTitle: title, isPreviewFree: newVal },
        { withCredentials: true }
      );
      onUpdated({ ...lecture, isPreviewFree: newVal });
    } catch {
      setPreview(!newVal);
    }
  };

  const handleVideoUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await axios.post("/api/v1/media/upload-video", fd, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          setUploadProgress(Math.round((e.loaded * 100) / e.total));
        },
      });
      if (data.success) {
        const videoInfo = { videoUrl: data.data.secure_url, publicId: data.data.public_id };
        await axios.post(
          `/api/v1/course/${courseId}/lecture/${lecture._id}`,
          { lectureTitle: title, isPreviewFree: preview, videoInfo },
          { withCredentials: true }
        );
        onUpdated({ ...lecture, videoUrl: videoInfo.videoUrl, publicId: videoInfo.publicId });
        toast.success("Video uploaded successfully!");
      }
    } catch (e) {
      toast.error("Video upload failed");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="border border-white/8 rounded-xl overflow-hidden">
      {/* Header row */}
      <div className="flex items-center gap-3 p-3 bg-white/3">
        <div className="w-7 h-7 rounded-lg bg-azure-500/15 flex items-center justify-center text-xs font-mono text-azure-400 shrink-0">
          {String(index + 1).padStart(2, "0")}
        </div>

        {editing ? (
          <input
            className="input flex-1 py-1.5 text-sm"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => e.key === "Enter" && saveTitle()}
            autoFocus
          />
        ) : (
          <span className="flex-1 text-sm text-white">{lecture.lectureTitle}</span>
        )}

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Preview free toggle */}
          <button
            onClick={togglePreview}
            title={preview ? "Free preview: ON" : "Free preview: OFF"}
            className={`p-1.5 rounded-lg transition-all text-xs ${
              preview ? "text-emerald-400 bg-emerald-500/10" : "text-white/25 hover:text-white/50"
            }`}
          >
            {preview ? <Eye size={13} /> : <EyeOff size={13} />}
          </button>

          {/* Expand / collapse */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-lg text-white/25 hover:text-white/60 hover:bg-white/5 transition-all"
          >
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          {/* Edit / save title */}
          {editing ? (
            <>
              <button onClick={saveTitle} className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-all">
                <Check size={13} />
              </button>
              <button onClick={() => { setEditing(false); setTitle(lecture.lectureTitle); }} className="p-1.5 rounded-lg text-white/30 hover:bg-white/5 transition-all">
                <X size={13} />
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg text-white/25 hover:text-white/60 hover:bg-white/5 transition-all">
              <Pencil size={13} />
            </button>
          )}

          {/* Delete */}
          <button
            onClick={() => onRemove(lecture._id)}
            className="p-1.5 rounded-lg text-white/20 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Expanded: video section */}
      {expanded && (
        <div className="p-4 border-t border-white/6 bg-navy-900/40 space-y-3">
          {/* Current video */}
          {lecture.videoUrl && (
            <div className="rounded-xl overflow-hidden bg-black">
              <video
                src={lecture.videoUrl}
                controls
                className="w-full max-h-48 object-contain"
              />
            </div>
          )}

          {/* Upload */}
          <div>
            <p className="text-xs text-white/40 mb-2">
              {lecture.videoUrl ? "Replace video:" : "Upload a video for this lecture:"}
            </p>
            {uploading ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <Loader size={12} className="animate-spin" />
                  Uploading… {uploadProgress}%
                </div>
                <div className="w-full h-1.5 bg-navy-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-azure-500 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <label className="btn-secondary text-xs cursor-pointer inline-flex items-center gap-2 py-2 px-4">
                <Upload size={13} />
                {lecture.videoUrl ? "Replace Video" : "Upload Video"}
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={e => handleVideoUpload(e.target.files[0])}
                />
              </label>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center gap-4 text-xs text-white/30">
            {lecture.videoUrl
              ? <span className="flex items-center gap-1 text-emerald-400"><Video size={11} /> Video uploaded</span>
              : <span className="flex items-center gap-1"><Video size={11} /> No video yet</span>
            }
            {preview && <span className="flex items-center gap-1 text-emerald-400"><Eye size={11} /> Free preview</span>}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Editor ──────────────────────────────────────────────────────────────
export default function CourseEditorPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [newLectureTitle, setNewLectureTitle] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [publishing, setPublishing] = useState(false);

  const levels = ["Beginner", "Medium", "Advance"];
  const categories = [
    "Next.js", "React", "JavaScript", "Python", "Data Science",
    "Machine Learning", "UI/UX Design", "Mobile Dev", "Backend", "Other",
  ];

  useEffect(() => {
    const load = async () => {
      const [cRes, lRes] = await Promise.all([
        axios.get(`/api/v1/course/${courseId}`, { withCredentials: true }),
        axios.get(`/api/v1/course/${courseId}/lecture`, { withCredentials: true }),
      ]);
      setCourse(cRes.data.course);
      setForm(cRes.data.course);
      setLectures(lRes.data.lectures || []);
    };
    load();
  }, [courseId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      const allowedKeys = ["courseTitle", "subTitle", "description", "category", "courseLevel", "coursePrice"];
      allowedKeys.forEach(k => { if (form[k] !== undefined && form[k] !== null) fd.append(k, form[k]); });
      if (thumbnail) fd.append("courseThumbnail", thumbnail);
      const { data } = await axios.put(`/api/v1/course/${courseId}`, fd, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      setCourse(data.course);
      toast.success("Course saved!");
    } catch {
      toast.error("Failed to save course");
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async () => {
    setPublishing(true);
    try {
      await axios.patch(
        `/api/v1/course/${courseId}?publish=${!course.isPublished}`,
        {},
        { withCredentials: true }
      );
      setCourse({ ...course, isPublished: !course.isPublished });
      toast.success(course.isPublished ? "Course unpublished" : "Course published!");
    } finally {
      setPublishing(false);
    }
  };

  const addLecture = async () => {
    if (!newLectureTitle.trim()) return;
    try {
      const { data } = await axios.post(
        `/api/v1/course/${courseId}/lecture`,
        { lectureTitle: newLectureTitle },
        { withCredentials: true }
      );
      setLectures(prev => [...prev, data.lecture]);
      setNewLectureTitle("");
      toast.success("Lecture added");
    } catch {
      toast.error("Failed to add lecture");
    }
  };

  const removeLecture = async (lectureId) => {
    if (!window.confirm("Remove this lecture?")) return;
    try {
      await axios.delete(`/api/v1/course/lecture/${lectureId}`, { withCredentials: true });
      setLectures(prev => prev.filter(l => l._id !== lectureId));
      toast.success("Lecture removed");
    } catch {
      toast.error("Failed to remove");
    }
  };

  const handleLectureUpdated = (updated) => {
    setLectures(prev => prev.map(l => l._id === updated._id ? updated : l));
  };

  if (!course) {
    return (
      <div className="flex justify-center pt-20">
        <div className="w-8 h-8 border-2 border-azure-500/30 border-t-azure-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Top bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button
          onClick={() => navigate("/courses")}
          className="flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors"
        >
          <ChevronLeft size={15} /> My Courses
        </button>
        <div className="flex gap-2">
          <button
            onClick={togglePublish}
            disabled={publishing}
            className={`text-sm flex items-center gap-2 py-2 px-4 rounded-xl border transition-all ${
              course.isPublished
                ? "border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                : "btn-secondary"
            }`}
          >
            {course.isPublished
              ? <><Lock size={13} /> Unpublish</>
              : <><Globe size={13} /> Publish</>}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary text-sm flex items-center gap-2"
          >
            <Save size={13} /> {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Course Details */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-white">Course Details</h2>
          {course.isPublished
            ? <span className="badge-green text-xs flex items-center gap-1"><Globe size={10} /> Published</span>
            : <span className="badge-amber text-xs flex items-center gap-1"><Lock size={10} /> Draft</span>
          }
        </div>

        <div className="grid gap-4">
          <div>
            <label className="label">Course Title *</label>
            <input className="input" value={form.courseTitle || ""}
              onChange={e => setForm({ ...form, courseTitle: e.target.value })}
              placeholder="Enter course title" />
          </div>
          <div>
            <label className="label">Subtitle</label>
            <input className="input" value={form.subTitle || ""}
              onChange={e => setForm({ ...form, subTitle: e.target.value })}
              placeholder="A short catchy description" />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={3} value={form.description || ""}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="What will students learn?" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Category</label>
              <select className="input" value={form.category || ""}
                onChange={e => setForm({ ...form, category: e.target.value })}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Level</label>
              <select className="input" value={form.courseLevel || ""}
                onChange={e => setForm({ ...form, courseLevel: e.target.value })}>
                <option value="">All Levels</option>
                {levels.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Price (₹) — leave empty for free</label>
            <input className="input" type="number" min="0" value={form.coursePrice || ""}
              onChange={e => setForm({ ...form, coursePrice: e.target.value })}
              placeholder="0" />
          </div>
          <div>
            <label className="label">Course Thumbnail</label>
            <div className="flex gap-3 items-center">
              {(thumbnail || form.courseThumbnail) && (
                <div className="relative">
                  <img
                    src={thumbnail ? URL.createObjectURL(thumbnail) : form.courseThumbnail}
                    alt="Thumbnail"
                    className="w-24 h-16 object-cover rounded-lg border border-white/10"
                  />
                  {thumbnail && (
                    <button onClick={() => setThumbnail(null)}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center">
                      <X size={9} className="text-white" />
                    </button>
                  )}
                </div>
              )}
              <label className="btn-secondary text-sm cursor-pointer flex items-center gap-2 py-2 px-4">
                <Upload size={13} />
                {form.courseThumbnail ? "Replace Thumbnail" : "Upload Thumbnail"}
                <input type="file" accept="image/*" className="hidden"
                  onChange={e => setThumbnail(e.target.files[0])} />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Lectures */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-white">
            Course Lectures
            <span className="text-white/25 text-base font-normal ml-2">({lectures.length})</span>
          </h2>
        </div>

        <p className="text-xs text-white/30">
          Click <Pencil size={10} className="inline" /> to rename, <ChevronDown size={10} className="inline" /> to expand and upload a video,{" "}
          <Eye size={10} className="inline" /> to toggle free preview.
        </p>

        {/* Add lecture */}
        <div className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="New lecture title…"
            value={newLectureTitle}
            onChange={e => setNewLectureTitle(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addLecture()}
          />
          <button
            onClick={addLecture}
            disabled={!newLectureTitle.trim()}
            className="btn-primary flex items-center gap-1 text-sm px-4 disabled:opacity-60"
          >
            <Plus size={14} /> Add
          </button>
        </div>

        {lectures.length === 0 ? (
          <div className="text-center py-8 text-white/20 text-sm border border-dashed border-white/10 rounded-xl">
            No lectures yet — add one above
          </div>
        ) : (
          <div className="space-y-2">
            {lectures.map((l, i) => (
              <LectureRow
                key={l._id}
                lecture={l}
                index={i}
                courseId={courseId}
                onUpdated={handleLectureUpdated}
                onRemove={removeLecture}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
