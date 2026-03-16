import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  BookOpen, Play, CheckCircle, Award, Clock, Search,
  ArrowRight, RefreshCw, User, Lock
} from "lucide-react";

function ProgressBar({ pct, completed }) {
  return (
    <div className="w-full h-1.5 bg-white/8 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${completed ? "bg-emerald-400" : "bg-azure-400"}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function CourseCard({ course, progressData, hasCertificate, onClick }) {
  const totalLectures = course.lectures?.length || 0;
  const viewedCount = progressData?.progress?.filter((l) => l.viewed).length || 0;
  const pct = totalLectures > 0 ? Math.round((viewedCount / totalLectures) * 100) : 0;
  const completed = pct === 100;
  const started = viewedCount > 0;

  return (
    <div
      onClick={onClick}
      className="card overflow-hidden border border-white/6 hover:border-white/14 transition-all group cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="relative h-40 bg-navy-800 overflow-hidden">
        {course.courseThumbnail ? (
          <img
            src={course.courseThumbnail}
            alt={course.courseTitle}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen size={32} className="text-white/10" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 to-transparent" />

        {/* Status badge */}
        <div className="absolute top-3 right-3">
          {hasCertificate ? (
            <span className="flex items-center gap-1 text-xs bg-amber-500/90 text-white px-2 py-1 rounded-full font-medium">
              <Award size={10} /> Certified
            </span>
          ) : completed ? (
            <span className="flex items-center gap-1 text-xs bg-emerald-500/90 text-white px-2 py-1 rounded-full">
              <CheckCircle size={10} /> Completed
            </span>
          ) : started ? (
            <span className="flex items-center gap-1 text-xs bg-azure-500/80 text-white px-2 py-1 rounded-full">
              <Play size={10} /> In Progress
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs bg-white/20 text-white px-2 py-1 rounded-full">
              <Lock size={10} /> Not Started
            </span>
          )}
        </div>

        {/* Progress line at bottom of thumbnail */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
          <div
            className={`h-full transition-all duration-700 ${completed ? "bg-emerald-400" : "bg-azure-400"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="p-4 space-y-3">
        {course.category && (
          <div className="text-xs text-azure-400">{course.category}</div>
        )}
        <h3 className="font-medium text-white leading-snug line-clamp-2 -mt-1">
          {course.courseTitle}
        </h3>
        {course.creator?.name && (
          <p className="text-xs text-white/35 flex items-center gap-1">
            <User size={9} /> {course.creator.name}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-white/40">
          <span className="flex items-center gap-1">
            <Clock size={10} />
            {totalLectures === 0 ? "No lectures yet" : `${viewedCount} / ${totalLectures} lectures`}
          </span>
          <span className={`font-semibold ${completed ? "text-emerald-400" : started ? "text-azure-400" : "text-white/30"}`}>
            {pct}%
          </span>
        </div>

        <ProgressBar pct={pct} completed={completed} />

        <button
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
            completed
              ? "bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/20"
              : "bg-azure-600 hover:bg-azure-500 text-white"
          }`}
        >
          {completed ? (
            <><CheckCircle size={14} /> Review Course</>
          ) : started ? (
            <><Play size={14} fill="currentColor" /> Continue Learning</>
          ) : (
            <><Play size={14} fill="currentColor" /> Start Learning</>
          )}
        </button>
      </div>
    </div>
  );
}

export default function MyCoursesPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      // This endpoint syncs CoursePurchase completed → enrolledCourses automatically
      const [coursesRes, certRes] = await Promise.allSettled([
        axios.get("/api/v1/user/enrolled-courses", { withCredentials: true }),
        axios.get("/api/v1/certificate/my", { withCredentials: true }),
      ]);

      const enrolledCourses =
        coursesRes.status === "fulfilled"
          ? coursesRes.value.data.courses || []
          : [];

      const certs =
        certRes.status === "fulfilled"
          ? certRes.value.data.certificates || []
          : [];

      setCourses(enrolledCourses);
      setCertificates(certs);

      if (enrolledCourses.length === 0) {
        setProgressMap({});
        if (isRefresh) toast("No enrolled courses found. Complete a purchase first.", { icon: "ℹ️" });
        return;
      }

      if (isRefresh) toast.success(`Found ${enrolledCourses.length} enrolled course(s)`);

      // Fetch progress for all enrolled courses in parallel
      const progressResults = await Promise.allSettled(
        enrolledCourses.map((c) =>
          axios
            .get(`/api/v1/progress/${c._id}`, { withCredentials: true })
            .then((r) => ({
              courseId: c._id,
              progress: r.data.data?.progress || [],
              completed: r.data.data?.completed || false,
            }))
            .catch(() => ({ courseId: c._id, progress: [], completed: false }))
        )
      );

      const pm = {};
      progressResults.forEach((r) => {
        if (r.status === "fulfilled") {
          pm[r.value.courseId] = r.value;
        }
      });
      setProgressMap(pm);
    } catch (err) {
      console.error("MyCoursesPage load error:", err);
      toast.error("Failed to load your courses");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const certCourseIds = new Set(certificates.map((c) => c.course?._id?.toString()));

  const getCoursePct = (c) => {
    const prog = progressMap[c._id];
    const viewed = prog?.progress?.filter((l) => l.viewed).length || 0;
    const total = c.lectures?.length || 0;
    return total > 0 ? Math.round((viewed / total) * 100) : 0;
  };

  const filtered = courses.filter((c) => {
    const matchSearch =
      !search ||
      c.courseTitle?.toLowerCase().includes(search.toLowerCase()) ||
      c.category?.toLowerCase().includes(search.toLowerCase()) ||
      c.creator?.name?.toLowerCase().includes(search.toLowerCase());

    const pct = getCoursePct(c);
    if (filter === "in-progress") return matchSearch && pct > 0 && pct < 100;
    if (filter === "completed") return matchSearch && pct === 100;
    if (filter === "not-started") return matchSearch && pct === 0;
    return matchSearch;
  });

  const completedCount = courses.filter((c) => getCoursePct(c) === 100).length;
  const inProgressCount = courses.filter((c) => { const p = getCoursePct(c); return p > 0 && p < 100; }).length;
  const notStartedCount = courses.filter((c) => getCoursePct(c) === 0).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="section-title flex items-center gap-2">
            <BookOpen size={20} className="text-azure-400" /> My Courses
          </h1>
          <p className="text-white/35 text-sm mt-1">
            {loading
              ? "Loading…"
              : `${courses.length} enrolled · ${completedCount} completed · ${certificates.length} certified`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadData(true)}
            disabled={refreshing || loading}
            className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white border border-white/10 hover:border-white/20 px-3 py-2 rounded-lg transition-all disabled:opacity-50"
            title="Sync — also picks up any purchases not yet reflected here"
          >
            <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Syncing…" : "Sync"}
          </button>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              className="input pl-9 py-2 text-sm w-48"
              placeholder="Search courses…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button onClick={() => navigate("/courses")} className="btn-primary text-sm flex items-center gap-2">
            <BookOpen size={14} /> Browse More
          </button>
        </div>
      </div>

      {/* Stats */}
      {!loading && courses.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Enrolled", value: courses.length, color: "azure" },
            { label: "In Progress", value: inProgressCount, color: "blue" },
            { label: "Completed", value: completedCount, color: "emerald" },
            { label: "Certified", value: certificates.length, color: "amber" },
          ].map(({ label, value, color }) => (
            <div key={label} className="card p-4 text-center">
              <div className={`text-2xl font-bold font-display ${
                color === "azure" ? "text-azure-400" :
                color === "blue" ? "text-blue-400" :
                color === "emerald" ? "text-emerald-400" :
                "text-amber-400"
              }`}>{value}</div>
              <div className="text-xs text-white/40 mt-1">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filter tabs */}
      {!loading && courses.length > 0 && (
        <div className="flex gap-1 bg-navy-900/60 rounded-xl p-1 border border-white/5 overflow-x-auto w-fit max-w-full">
          {[
            { id: "all", label: `All (${courses.length})` },
            { id: "in-progress", label: `In Progress (${inProgressCount})` },
            { id: "completed", label: `Completed (${completedCount})` },
            { id: "not-started", label: `Not Started (${notStartedCount})` },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                filter === id ? "bg-azure-600 text-white" : "text-white/40 hover:text-white/70"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 rounded-2xl shimmer" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 text-center">
          <BookOpen size={44} className="text-white/10 mb-4" />
          <p className="text-white/30 font-semibold text-lg">No enrolled courses yet</p>
          <p className="text-white/20 text-sm mt-2 max-w-xs leading-relaxed">
            After purchasing a course, it appears here. If you've purchased but don't see it, click Sync.
          </p>
          <div className="flex gap-3 mt-5">
            <button onClick={() => loadData(true)} className="btn-secondary text-sm flex items-center gap-2">
              <RefreshCw size={13} /> Sync Purchases
            </button>
            <button onClick={() => navigate("/courses")} className="btn-primary text-sm flex items-center gap-2">
              <BookOpen size={13} /> Browse Courses <ArrowRight size={13} />
            </button>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <Search size={36} className="text-white/10 mb-4" />
          <p className="text-white/30 font-medium">No courses match your filter</p>
          <button onClick={() => { setSearch(""); setFilter("all"); }} className="btn-secondary text-sm mt-4">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((c) => (
            <CourseCard
              key={c._id}
              course={c}
              progressData={progressMap[c._id]}
              hasCertificate={certCourseIds.has(c._id?.toString())}
              onClick={() => navigate(`/course-progress/${c._id}`)}
            />
          ))}
        </div>
      )}

      {/* Certificate banner */}
      {!loading && certificates.length > 0 && (
        <div
          onClick={() => navigate("/certificates")}
          className="card p-5 border border-amber-500/20 bg-amber-500/5 flex items-center gap-4 cursor-pointer hover:border-amber-500/40 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-500/15 flex items-center justify-center flex-shrink-0">
            <Award size={22} className="text-amber-400" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-white text-sm">
              🎓 You have {certificates.length} certificate{certificates.length > 1 ? "s" : ""}!
            </p>
            <p className="text-white/40 text-xs mt-0.5">View, print and download your earned certificates</p>
          </div>
          <ArrowRight size={16} className="text-amber-400 flex-shrink-0" />
        </div>
      )}
    </div>
  );
}