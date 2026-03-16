import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { ChevronLeft, CheckCircle, Circle, Play, BookOpen, Award } from "lucide-react";

export default function CourseProgressPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  // ── On mount: if Stripe redirected here with session_id, verify payment first ──
  useEffect(() => {
    const sessionId = searchParams.get("session_id");

    const init = async () => {
      try {
        if (sessionId) {
          setVerifying(true);
          try {
            const { data: verifyData } = await axios.get(
              `/api/v1/purchase/verify/${sessionId}`,
              { withCredentials: true }
            );
            if (verifyData.success) {
              toast.success("🎉 Enrollment confirmed! Welcome to the course.");
            }
          } catch (err) {
            console.warn("Payment verify error (non-fatal):", err?.response?.data?.message);
          } finally {
            setVerifying(false);
            // Clean session_id from URL without reload
            navigate(`/course-progress/${courseId}`, { replace: true });
          }
        }

        // Load course progress
        const { data: res } = await axios.get(`/api/v1/progress/${courseId}`, {
          withCredentials: true,
        });
        setData(res.data);
        if (res.data.courseDetails.lectures?.length) {
          setCurrentLecture(res.data.courseDetails.lectures[0]);
        }
      } catch (err) {
        console.error("CourseProgressPage init error:", err);
        toast.error("Failed to load course");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [courseId]); // eslint-disable-line

  const markViewed = async (lectureId) => {
    try {
      await axios.post(
        `/api/v1/progress/${courseId}/lecture/${lectureId}/view`,
        {},
        { withCredentials: true }
      );
      const { data: res } = await axios.get(`/api/v1/progress/${courseId}`, {
        withCredentials: true,
      });
      setData(res.data);

      // Show certificate toast if just completed
      if (res.data.completed) {
        toast.success("🎓 Course completed! Check your Certificates page.", { duration: 5000 });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const isViewed = (lectureId) =>
    data?.progress?.some((p) => p.lectureId === lectureId && p.viewed);

  if (loading || verifying) {
    return (
      <div className="flex flex-col items-center justify-center pt-20 gap-3">
        <div className="w-8 h-8 border-2 border-azure-500/30 border-t-azure-500 rounded-full animate-spin" />
        {verifying && (
          <p className="text-white/40 text-sm animate-pulse">Confirming your enrollment…</p>
        )}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center pt-20 gap-3 text-center">
        <BookOpen size={40} className="text-white/10" />
        <p className="text-white/40">Course not found or not enrolled.</p>
        <button onClick={() => navigate("/courses")} className="btn-primary text-sm mt-2">
          Browse Courses
        </button>
      </div>
    );
  }

  const { courseDetails, completed } = data;
  const viewedCount = data.progress?.filter((p) => p.viewed).length || 0;
  const totalCount = courseDetails.lectures?.length || 0;
  const progress = totalCount ? Math.round((viewedCount / totalCount) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/my-courses")}
          className="flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors"
        >
          <ChevronLeft size={15} /> Back to My Courses
        </button>
        <div className="flex items-center gap-2">
          {completed && (
            <span className="badge-green flex items-center gap-1">
              <CheckCircle size={11} /> Completed
            </span>
          )}
          {completed && (
            <button
              onClick={() => navigate("/certificates")}
              className="flex items-center gap-1.5 text-xs bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/20 px-3 py-1.5 rounded-lg transition-all"
            >
              <Award size={12} /> View Certificate
            </button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Video Player */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card overflow-hidden">
            <div className="aspect-video bg-navy-900 flex items-center justify-center relative">
              {currentLecture?.videoUrl ? (
                <video
                  src={currentLecture.videoUrl}
                  controls
                  className="w-full h-full"
                  onEnded={() => markViewed(currentLecture._id)}
                />
              ) : (
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                    <Play size={24} className="text-white/20" />
                  </div>
                  <p className="text-white/30 text-sm">No video available</p>
                </div>
              )}
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-display text-lg font-semibold text-white">
                    {currentLecture?.lectureTitle || "Select a lecture"}
                  </h2>
                  <p className="text-white/35 text-sm mt-1">{courseDetails.courseTitle}</p>
                </div>
                {currentLecture && !isViewed(currentLecture._id) && (
                  <button
                    onClick={() => markViewed(currentLecture._id)}
                    className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"
                  >
                    <CheckCircle size={12} /> Mark as Done
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/50">
                {viewedCount}/{totalCount} lectures completed
              </span>
              <span className={`text-sm font-medium ${progress === 100 ? "text-emerald-400" : "text-azure-400"}`}>
                {progress}%
              </span>
            </div>
            <div className="w-full h-2 bg-navy-900 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  progress === 100
                    ? "bg-gradient-to-r from-emerald-600 to-emerald-400"
                    : "bg-gradient-to-r from-azure-600 to-azure-400"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Lecture list */}
        <div className="card p-4">
          <h3 className="font-medium text-white mb-3 flex items-center gap-2">
            <BookOpen size={14} className="text-azure-400" /> Course Content
          </h3>
          <div className="space-y-1.5 max-h-[60vh] overflow-y-auto">
            {courseDetails.lectures?.map((l, i) => {
              const viewed = isViewed(l._id);
              const active = currentLecture?._id === l._id;
              return (
                <button
                  key={l._id}
                  onClick={() => setCurrentLecture(l)}
                  className={`w-full text-left flex items-center gap-3 p-3 rounded-xl transition-all ${
                    active
                      ? "bg-azure-600/20 border border-azure-500/30"
                      : "hover:bg-white/5"
                  }`}
                >
                  <div className="flex-shrink-0">
                    {viewed ? (
                      <CheckCircle size={15} className="text-emerald-400" />
                    ) : (
                      <Circle size={15} className="text-white/20" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className={`text-xs font-medium truncate ${
                        active ? "text-white" : "text-white/60"
                      }`}
                    >
                      {l.lectureTitle}
                    </div>
                    <div className="text-xs text-white/25">Lecture {i + 1}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}