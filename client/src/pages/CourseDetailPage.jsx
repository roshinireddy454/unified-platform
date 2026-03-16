import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { BookOpen, Users, ChevronLeft, Lock, Play, CreditCard, CheckCircle } from "lucide-react";

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState({ course: null, purchased: false });
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const { data: res } = await axios.get(
          `/api/v1/purchase/course/${courseId}/detail-with-status`,
          { withCredentials: true }
        );
        setData(res);
      } catch {
        try {
          const { data: res } = await axios.get(`/api/v1/course/${courseId}`, {
            withCredentials: true,
          });
          setData({ course: res.course, purchased: false });
        } catch {
          toast.error("Failed to load course");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  const handleEnroll = async () => {
    if (data.purchased) {
      navigate(`/course-progress/${courseId}`);
      return;
    }
    if (!data.course.coursePrice) {
      // Free course — enroll directly via progress route (creates a progress record)
      navigate(`/course-progress/${courseId}`);
      return;
    }
    setPurchasing(true);
    try {
      const { data: res } = await axios.post(
        "/api/v1/purchase/checkout/create-checkout-session",
        { courseId },
        { withCredentials: true }
      );
      if (res.url) window.location.href = res.url;
    } catch (e) {
      toast.error("Failed to initiate purchase");
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center pt-20">
        <div className="w-8 h-8 border-2 border-azure-500/30 border-t-azure-500 rounded-full animate-spin" />
      </div>
    );
  }
  if (!data.course) {
    return <div className="text-center text-white/40 pt-20">Course not found</div>;
  }

  const { course } = data;
  const levels = { Beginner: "badge-green", Medium: "badge-amber", Advance: "badge-rose" };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <button
        onClick={() => navigate("/courses")}
        className="flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors"
      >
        <ChevronLeft size={15} /> Back to courses
      </button>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          <div className="card overflow-hidden">
            <div className="h-56 bg-navy-800 relative">
              {course.courseThumbnail ? (
                <img
                  src={course.courseThumbnail}
                  alt={course.courseTitle}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen size={40} className="text-white/10" />
                </div>
              )}
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="badge-blue text-xs">{course.category}</span>
                {course.courseLevel && (
                  <span className={`${levels[course.courseLevel] || "badge-blue"} text-xs`}>
                    {course.courseLevel}
                  </span>
                )}
              </div>
              <h1 className="font-display text-2xl font-semibold text-white mb-2">
                {course.courseTitle}
              </h1>
              {course.subTitle && (
                <p className="text-white/50 mb-3">{course.subTitle}</p>
              )}

              {/* ── FIX: Render HTML description safely instead of as raw text ── */}
              {course.description && (
                <div
                  className="text-white/40 text-sm leading-relaxed prose-invert max-w-none
                    [&_strong]:text-white/70 [&_em]:italic [&_u]:underline
                    [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4
                    [&_li]:mt-1 [&_p]:mb-2 [&_h3]:text-white/60 [&_h3]:font-semibold"
                  dangerouslySetInnerHTML={{ __html: course.description }}
                />
              )}

              <div className="flex items-center gap-6 mt-4 pt-4 border-t border-white/5 text-white/30 text-sm">
                <div className="flex items-center gap-1.5">
                  <Users size={13} /> {course.enrolledStudents?.length || 0} students
                </div>
                <div className="flex items-center gap-1.5">
                  <BookOpen size={13} /> {course.lectures?.length || 0} lectures
                </div>
              </div>
            </div>
          </div>

          {/* Lectures preview */}
          {course.lectures?.length > 0 && (
            <div className="card p-5">
              <h2 className="font-medium text-white mb-3">Course Content</h2>
              <div className="space-y-2">
                {course.lectures.map((l, i) => (
                  <div
                    key={l._id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/3"
                  >
                    <div className="w-6 h-6 rounded-full bg-azure-500/15 flex items-center justify-center flex-shrink-0">
                      {l.isPreviewFree || data.purchased ? (
                        <Play size={10} className="text-azure-400" />
                      ) : (
                        <Lock size={10} className="text-white/30" />
                      )}
                    </div>
                    <span className="text-sm text-white/70 flex-1">{l.lectureTitle}</span>
                    <span className="text-xs text-white/25">Lecture {i + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="card p-5 sticky top-4">
            <div className="text-3xl font-display font-semibold text-white mb-1">
              {course.coursePrice ? (
                `₹${course.coursePrice}`
              ) : (
                <span className="text-emerald-400">Free</span>
              )}
            </div>

            <button
              onClick={handleEnroll}
              disabled={purchasing}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-3"
            >
              {purchasing ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : data.purchased ? (
                <><Play size={15} fill="currentColor" /> Continue Learning</>
              ) : course.coursePrice ? (
                <><CreditCard size={15} /> Enroll Now</>
              ) : (
                <><Play size={15} /> Start Free Course</>
              )}
            </button>

            {data.purchased && (
              <div className="flex items-center justify-center gap-1.5 mt-2 text-xs text-emerald-400">
                <CheckCircle size={12} /> Already enrolled
              </div>
            )}

            <div className="border-t border-white/6 mt-4 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-white/40">
                <span>Lectures</span>
                <span className="text-white">{course.lectures?.length || 0}</span>
              </div>
              <div className="flex justify-between text-white/40">
                <span>Level</span>
                <span className="text-white">{course.courseLevel || "All levels"}</span>
              </div>
              <div className="flex justify-between text-white/40">
                <span>Students</span>
                <span className="text-white">{course.enrolledStudents?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}