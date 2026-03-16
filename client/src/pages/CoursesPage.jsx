import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";
import { BookOpen, Plus, Search, Star, Users, Lock, Globe, Pencil } from "lucide-react";

function CourseCard({ course, onClick, isInstructor }) {
  return (
    <div onClick={onClick} className="card-hover overflow-hidden cursor-pointer group">
      <div className="relative h-40 bg-navy-800 overflow-hidden">
        {course.courseThumbnail
          ? <img src={course.courseThumbnail} alt={course.courseTitle} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full flex items-center justify-center"><BookOpen size={32} className="text-white/10" /></div>
        }
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 to-transparent" />
        <div className="absolute top-3 right-3">
          {course.isPublished
            ? <span className="badge-green text-xs"><Globe size={9} />Published</span>
            : <span className="badge-amber text-xs"><Lock size={9} />Draft</span>
          }
        </div>
      </div>
      <div className="p-4">
        <div className="text-xs text-azure-400 mb-1">{course.category}</div>
        <h3 className="font-medium text-white leading-snug line-clamp-2">{course.courseTitle}</h3>
        {course.subTitle && <p className="text-xs text-white/35 mt-1 line-clamp-1">{course.subTitle}</p>}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
          <div className="flex items-center gap-1 text-white/30 text-xs">
            <Users size={11} /> {course.enrolledStudents?.length || 0} enrolled
          </div>
          {course.coursePrice
            ? <span className="text-emerald-400 font-semibold text-sm">₹{course.coursePrice}</span>
            : <span className="badge-green text-xs">Free</span>
          }
        </div>
        {isInstructor && (
          <div className="flex items-center gap-1 text-xs text-azure-400 mt-2">
            <Pencil size={10} /> Click to manage
          </div>
        )}
      </div>
    </div>
  );
}

export default function CoursesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ courseTitle: "", category: "" });
  const [creating, setCreating] = useState(false);

  const isInstructor = user?.role === "instructor";

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const endpoint = isInstructor ? "/api/v1/course" : "/api/v1/course/published-courses";
        const { data } = await axios.get(endpoint, { withCredentials: true });
        setCourses(data.courses || []);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [isInstructor]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const { data } = await axios.post("/api/v1/course", form, { withCredentials: true });
      toast.success("Course created!");
      setShowCreate(false);
      navigate(`/courses/editor/${data.course._id}`);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to create course");
    } finally {
      setCreating(false);
    }
  };

  const filtered = courses.filter(c =>
    c.courseTitle?.toLowerCase().includes(search.toLowerCase()) ||
    c.category?.toLowerCase().includes(search.toLowerCase())
  );

  const categories = ["Next.js", "React", "JavaScript", "Python", "Data Science", "Machine Learning", "UI/UX Design", "Mobile Dev", "Backend", "Other"];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">{isInstructor ? "My Courses" : "Browse Courses"}</h1>
          <p className="text-white/35 text-sm mt-1">
            {isInstructor ? "Manage your created courses" : "Discover and enroll in courses"}
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input className="input pl-8 py-2 text-sm w-52" placeholder="Search courses..." value={search}
              onChange={e => setSearch(e.target.value)} />
          </div>
          {isInstructor && (
            <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 text-sm">
              <Plus size={14} /> New Course
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-64 rounded-2xl shimmer" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <BookOpen size={40} className="text-white/10 mb-4" />
          <p className="text-white/30 font-medium">{search ? "No courses match your search" : isInstructor ? "No courses created yet" : "No courses available"}</p>
          {isInstructor && !search && (
            <button onClick={() => setShowCreate(true)} className="btn-primary text-sm mt-4 flex items-center gap-1">
              <Plus size={13} /> Create your first course
            </button>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(c => (
            <CourseCard key={c._id} course={c} isInstructor={isInstructor}
              onClick={() => isInstructor ? navigate(`/courses/editor/${c._id}`) : navigate(`/courses/${c._id}`)} />
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md p-6 animate-slide-up">
            <h3 className="font-display text-lg font-semibold text-white mb-4">Create New Course</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="label">Course Title *</label>
                <input className="input" placeholder="e.g. Complete React Masterclass" value={form.courseTitle}
                  onChange={e => setForm({ ...form, courseTitle: e.target.value })} required />
              </div>
              <div>
                <label className="label">Category *</label>
                <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required>
                  <option value="">Select a category</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={creating} className="btn-primary flex-1">
                  {creating ? "Creating..." : "Create & Edit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
