import { useEffect, useState } from "react";
import axios from "axios";
import { Users, BookOpen, Mail, Calendar, Search, User } from "lucide-react";
import { format } from "date-fns";

export default function EnrolledStudentsPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");

  useEffect(() => {
    axios
      .get("/api/v1/meeting/enrolled-students", { withCredentials: true })
      .then(({ data }) => setCourses(data.courses || []))
      .finally(() => setLoading(false));
  }, []);

  const allStudents = courses.flatMap((c) =>
    (c.enrolledStudents || []).map((s) => ({ ...s, courseName: c.courseTitle, courseId: c._id }))
  );

  const uniqueStudents = Object.values(
    allStudents.reduce((acc, s) => {
      if (!acc[s._id]) acc[s._id] = { ...s, courses: [s.courseName] };
      else acc[s._id].courses.push(s.courseName);
      return acc;
    }, {})
  );

  const filtered = uniqueStudents.filter((s) => {
    const matchSearch =
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase());
    const matchCourse =
      selectedCourse === "all" || s.courses.some((c) => c === selectedCourse);
    return matchSearch && matchCourse;
  });

  const totalEnrolled = new Set(allStudents.map((s) => s._id)).size;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="section-title flex items-center gap-2">
            <Users size={20} className="text-azure-400" /> Enrolled Students
          </h1>
          <p className="text-white/35 text-sm mt-1">
            {totalEnrolled} student{totalEnrolled !== 1 ? "s" : ""} across {courses.length} course{courses.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            className="input pl-9 py-2 text-sm w-52"
            placeholder="Search students…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Course filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedCourse("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            selectedCourse === "all"
              ? "bg-azure-600 text-white"
              : "bg-white/5 text-white/50 hover:text-white border border-white/10"
          }`}
        >
          All Courses
        </button>
        {courses.map((c) => (
          <button
            key={c._id}
            onClick={() => setSelectedCourse(c.courseTitle)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedCourse === c.courseTitle
                ? "bg-azure-600 text-white"
                : "bg-white/5 text-white/50 hover:text-white border border-white/10"
            }`}
          >
            {c.courseTitle} ({c.enrolledStudents?.length || 0})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-28 rounded-2xl shimmer" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <Users size={40} className="text-white/10 mb-4" />
          <p className="text-white/30 font-medium">
            {search ? "No students match your search" : "No students enrolled yet"}
          </p>
          <p className="text-white/20 text-sm mt-1">
            Students who purchase your courses will appear here
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s) => (
            <div key={s._id} className="card p-5 border border-white/6 hover:border-white/12 transition-all">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-azure-500 to-emerald-500 flex items-center justify-center text-sm font-semibold flex-shrink-0 overflow-hidden">
                  {s.photoUrl ? (
                    <img src={s.photoUrl} alt={s.name} className="w-full h-full object-cover" />
                  ) : (
                    s.name?.[0]?.toUpperCase() || <User size={14} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm truncate">{s.name}</p>
                  <p className="text-white/40 text-xs flex items-center gap-1 mt-0.5 truncate">
                    <Mail size={9} /> {s.email}
                  </p>
                  {s.createdAt && (
                    <p className="text-white/25 text-xs flex items-center gap-1 mt-0.5">
                      <Calendar size={9} /> Joined {format(new Date(s.createdAt), "MMM d, yyyy")}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {s.courses.map((c, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1 text-xs bg-azure-500/10 text-azure-400 border border-azure-500/20 px-2 py-0.5 rounded-full"
                  >
                    <BookOpen size={8} /> {c}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}