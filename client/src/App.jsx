import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Layout               from "./components/Layout";
import AuthPage             from "./pages/AuthPage";
import TeacherSignupPage    from "./pages/TeacherSignupPage";
import VerifyEmailPage      from "./pages/VerifyEmailPage";
import { ForgotPasswordPage, ResetPasswordPage } from "./pages/PasswordPages";
import AdminInvitePage      from "./pages/AdminInvitePage";
import Dashboard            from "./pages/Dashboard";
import CoursesPage          from "./pages/CoursesPage";
import MyCoursesPage        from "./pages/MyCoursesPage";
import CourseDetailPage     from "./pages/CourseDetailPage";
import CourseProgressPage   from "./pages/CourseProgressPage";
import CourseEditorPage     from "./pages/CourseEditorPage";
import MeetingsPage         from "./pages/MeetingsPage";
import MeetingRoomPage      from "./pages/MeetingRoomPage";
import AttendancePage       from "./pages/AttendancePage";
import SummariesPage        from "./pages/SummariesPage";
import ProfilePage          from "./pages/ProfilePage";
import DoubtPage            from "./pages/DoubtPage";
import CertificatePage      from "./pages/CertificatePage";
import ChatbotPage          from "./pages/ChatbotPage";
import EnrolledStudentsPage from "./pages/EnrolledStudentsPage";
import LoadingScreen        from "./components/LoadingScreen";
import TodoPage             from "./pages/TodoPage";
import TestManagerPage      from "./pages/TestManagerPage";
import QuestionBankPage     from "./pages/QuestionBankPage";
import StudentTestsPage     from "./pages/StudentTestsPage";
import TestAttemptPage      from "./pages/TestAttemptPage";
import TestResultPage       from "./pages/TestResultPage";

// ── Route guards ──────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user)   return <Navigate to="/auth" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user)    return <Navigate to="/" replace />;
  return children;
};

// Teacher signup is public (accessible without auth) but token-gated server-side
const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user)    return <Navigate to="/" replace />;
  return children;
};

const InstructorRoute = ({ children }) => {
  const { user } = useAuth();
  if (user?.role !== "instructor") return <Navigate to="/" replace />;
  return children;
};

const StudentRoute = ({ children }) => {
  const { user } = useAuth();
  if (user?.role !== "student") return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  return (
    <Routes>
      {/* ── Public auth routes ─────────────────────────────── */}
      <Route path="/auth"             element={<PublicRoute><AuthPage /></PublicRoute>} />
      <Route path="/teacher-signup"   element={<PublicOnlyRoute><TeacherSignupPage /></PublicOnlyRoute>} />
      <Route path="/verify-email"     element={<VerifyEmailPage />} />
      <Route path="/forgot-password"  element={<PublicOnlyRoute><ForgotPasswordPage /></PublicOnlyRoute>} />
      <Route path="/reset-password"   element={<PublicOnlyRoute><ResetPasswordPage /></PublicOnlyRoute>} />
      {/* Admin panel — no auth required, protected by admin secret key */}
      <Route path="/admin/invites"    element={<AdminInvitePage />} />

      {/* ── Protected app routes ───────────────────────────── */}
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />

        {/* Courses */}
        <Route path="courses"                   element={<CoursesPage />}        />
        <Route path="courses/:courseId"         element={<CourseDetailPage />}   />
        <Route path="course-progress/:courseId" element={<CourseProgressPage />} />
        <Route path="courses/editor/:courseId"  element={<CourseEditorPage />}   />

        <Route path="my-courses"    element={<StudentRoute><MyCoursesPage /></StudentRoute>} />
        <Route path="meetings"      element={<MeetingsPage />}   />
        <Route path="attendance"    element={<AttendancePage />} />
        <Route path="summaries"     element={<SummariesPage />}  />
        <Route path="profile"       element={<ProfilePage />}    />
        <Route path="doubts"        element={<DoubtPage />}      />
        <Route path="chatbot"       element={<ChatbotPage />}    />

        {/* Student-only */}
        <Route path="certificates"              element={<StudentRoute><CertificatePage /></StudentRoute>}  />
        <Route path="todo"                      element={<StudentRoute><TodoPage /></StudentRoute>}         />
        <Route path="my-tests"                  element={<StudentRoute><StudentTestsPage /></StudentRoute>} />
        <Route path="test/:testId/attempt"      element={<StudentRoute><TestAttemptPage /></StudentRoute>}  />
        <Route path="test/:testId/result"       element={<StudentRoute><TestResultPage /></StudentRoute>}   />

        {/* Instructor-only */}
        <Route path="enrolled-students"  element={<InstructorRoute><EnrolledStudentsPage /></InstructorRoute>} />
        <Route path="test-manager"       element={<InstructorRoute><TestManagerPage /></InstructorRoute>}      />
        <Route path="question-bank"      element={<InstructorRoute><QuestionBankPage /></InstructorRoute>}     />
      </Route>

      {/* Meeting room — full screen, outside Layout */}
      <Route path="/meeting/:meetingId" element={<ProtectedRoute><MeetingRoomPage /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}