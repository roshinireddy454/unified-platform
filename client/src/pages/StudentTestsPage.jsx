import { useEffect, useState } from "react";
import axios from "axios";
import { ClipboardList, Clock, Calendar, BookOpen, ChevronRight, Trophy, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

const STATUS_STYLES = {
  Active: "badge-green",
  Upcoming: "badge-blue",
  Expired: "text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/30",
};

export default function StudentTestsPage() {
  const [myCourses, setMyCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [myResults, setMyResults] = useState([]);
  const [view, setView] = useState("tests"); // "tests" | "results"

  useEffect(() => {
    axios.get("/api/v1/user/enrolled-courses", { withCredentials: true })
      .then(({ data }) => {
        setMyCourses(data.courses || []);
        if (data.courses?.length > 0) setSelectedCourse(data.courses[0]._id);
      });
    axios.get("/api/v1/test/my-results", { withCredentials: true })
      .then(({ data }) => setMyResults(data.submissions || []));
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;
    setLoading(true);
    axios.get(`/api/v1/test/student/course/${selectedCourse}`, { withCredentials: true })
      .then(({ data }) => setTests(data.tests || []))
      .catch(() => toast.error("Failed to fetch tests"))
      .finally(() => setLoading(false));
  }, [selectedCourse]);

  const hasAttempted = (testId) => myResults.some((r) => String(r.test?._id) === String(testId) || String(r.test) === String(testId));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-white">Tests & Assessments</h1>
          <p className="text-white/40 text-sm mt-1">Attempt scheduled tests for your courses</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setView("tests")}
            className={`text-sm px-4 py-2 rounded-xl transition-all ${view === "tests" ? "bg-blue-500 text-white" : "bg-white/5 text-white/50 hover:bg-white/10"}`}>
            Tests
          </button>
          <button onClick={() => setView("results")}
            className={`text-sm px-4 py-2 rounded-xl transition-all ${view === "results" ? "bg-blue-500 text-white" : "bg-white/5 text-white/50 hover:bg-white/10"}`}>
            My Results
          </button>
        </div>
      </div>

      {view === "tests" ? (
        <>
          <div className="card p-4 flex items-center gap-3">
            <BookOpen size={16} className="text-white/30" />
            <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="input flex-1 max-w-xs">
              {myCourses.map((c) => <option key={c._id} value={c._id}>{c.courseTitle}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-24 shimmer rounded-xl" />)}</div>
          ) : tests.length === 0 ? (
            <div className="card p-12 flex flex-col items-center text-center">
              <ClipboardList size={40} className="text-white/15 mb-3" />
              <p className="text-white/40">No tests scheduled for this course yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tests.map((test) => {
                const attempted = hasAttempted(test._id);
                return (
                  <div key={test._id} className="card p-5 hover:border-white/15 transition-all">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium text-white">{test.title}</h3>
                          <span className={STATUS_STYLES[test.status]}>{test.status}</span>
                          {attempted && <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">Attempted ✓</span>}
                        </div>
                        {test.description && <p className="text-sm text-white/40 mt-1">{test.description}</p>}
                        <div className="flex flex-wrap items-center gap-4 mt-2">
                          <span className="flex items-center gap-1 text-xs text-white/30"><Clock size={11} />{test.duration} min</span>
                          <span className="flex items-center gap-1 text-xs text-white/30"><Calendar size={11} />{new Date(test.startTime).toLocaleString()}</span>
                          <span className="text-xs text-white/30">{test.totalMarks} marks</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {attempted ? (
                          <a href={`/test/${test._id}/result`}
                            className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-xl bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-colors">
                            <Trophy size={14} /> View Result
                          </a>
                        ) : test.status === "Active" ? (
                          <a href={`/test/${test._id}/attempt`}
                            className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-400 transition-colors">
                            Start Test <ChevronRight size={14} />
                          </a>
                        ) : (
                          <span className="text-xs text-white/25">{test.status === "Upcoming" ? "Not open yet" : "Closed"}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-3">
          {myResults.length === 0 ? (
            <div className="card p-12 flex flex-col items-center text-center">
              <Trophy size={40} className="text-white/15 mb-3" />
              <p className="text-white/40">No test results yet.</p>
            </div>
          ) : myResults.map((sub) => (
            <div key={sub._id} className="card p-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="font-medium text-white">{sub.test?.title || "Test"}</p>
                  <p className="text-xs text-white/40 mt-0.5">{new Date(sub.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-semibold font-display text-white">{sub.totalMarksObtained}/{sub.totalMarks}</p>
                    <p className="text-xs text-white/40">{sub.percentage}%</p>
                  </div>
                  <a href={`/test/${sub.test?._id || sub.test}/result`}
                    className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 transition-colors">
                    Details
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
