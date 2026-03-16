import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import {
  Award, Download, BookOpen, CheckCircle, Clock, Search, ExternalLink, Printer
} from "lucide-react";
import { format } from "date-fns";

// ─── Print/Download certificate ───────────────────────────────
function printCert(cert) {
  const win = window.open("", "_blank");
  win.document.write(`<!DOCTYPE html><html><head><title>Certificate - ${cert.course?.courseTitle || "Course"}</title>
<style>
  body { margin: 0; font-family: Georgia, serif; background: #fff; }
  .cert { width: 842px; height: 595px; margin: 0 auto; border: 12px solid #1e3a5f; padding: 50px;
    box-sizing: border-box; position: relative; display: flex; flex-direction: column;
    align-items: center; justify-content: center; text-align: center; }
  .inner { position: absolute; inset: 18px; border: 2px solid #c9a84c; pointer-events: none; }
  .logo { font-size: 26px; color: #1e3a5f; font-weight: bold; margin-bottom: 6px; }
  .sub  { font-size: 12px; color: #999; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 28px; }
  .title { font-size: 38px; color: #c9a84c; margin-bottom: 10px; }
  .presented { font-size: 14px; color: #666; margin-bottom: 6px; }
  .name { font-size: 32px; color: #1e3a5f; border-bottom: 2px solid #c9a84c; display: inline-block;
    padding-bottom: 4px; margin-bottom: 14px; }
  .cl { font-size: 13px; color: #666; margin-bottom: 5px; }
  .course { font-size: 18px; color: #1e3a5f; margin-bottom: 22px; font-style: italic; }
  .meta { display: flex; gap: 60px; justify-content: center; margin-top: 16px; }
  .mv { font-size: 12px; color: #1e3a5f; font-weight: bold; border-top: 1px solid #ccc; padding-top: 4px; margin-top: 4px; }
  .ml { font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 1px; }
  .cid { position: absolute; bottom: 24px; right: 36px; font-size: 9px; color: #ccc; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style></head><body>
<div class="cert">
  <div class="inner"></div>
  <div class="logo">🎓 LearnSphere</div>
  <div class="sub">Certificate of Completion</div>
  <div class="title">Certificate of Achievement</div>
  <div class="presented">This certifies that</div>
  <div class="name">${cert.student?.name || "Student"}</div>
  <div class="cl">has successfully completed the course</div>
  <div class="course">${cert.course?.courseTitle || "Course"}</div>
  <div class="meta">
    <div><div class="ml">Instructor</div><div class="mv">${cert.course?.creator?.name || "Instructor"}</div></div>
    <div><div class="ml">Issue Date</div><div class="mv">${format(new Date(cert.issuedAt), "MMMM d, yyyy")}</div></div>
    <div><div class="ml">Completion</div><div class="mv">100%</div></div>
  </div>
  <div class="cid">Certificate ID: ${cert.certificateId}</div>
</div>
<script>window.onload = () => { window.print(); }</script>
</body></html>`);
  win.document.close();
}

// ─── Certificate Card ─────────────────────────────────────────
function CertCard({ cert }) {
  return (
    <div className="card p-6 border border-white/6 hover:border-amber-500/30 transition-all">
      <div className="w-full h-28 rounded-xl bg-gradient-to-br from-amber-900/30 to-navy-800 border border-amber-500/20 flex flex-col items-center justify-center mb-4 relative overflow-hidden">
        <div className="absolute inset-2 border border-amber-500/10 rounded-lg" />
        <Award size={28} className="text-amber-400 mb-1" />
        <p className="text-amber-300 text-xs font-medium">Certificate of Completion</p>
        <p className="text-white/25 text-xs">LearnSphere</p>
      </div>
      <h3 className="font-semibold text-white text-sm leading-snug mb-1">{cert.course?.courseTitle}</h3>
      <p className="text-xs text-white/40 mb-1">Instructor: {cert.course?.creator?.name || "—"}</p>
      <div className="flex items-center gap-2 text-xs text-white/30 mb-1">
        <Clock size={10} /> Issued {format(new Date(cert.issuedAt), "MMM d, yyyy")}
      </div>
      <div className="text-xs text-white/20 font-mono truncate mb-4">ID: {cert.certificateId}</div>
      <div className="flex gap-2 pt-4 border-t border-white/5">
        <button onClick={() => printCert(cert)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs transition-all">
          <Printer size={12} /> View & Print
        </button>
        <button onClick={() => printCert(cert)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs transition-all">
          <Download size={12} /> Download
        </button>
      </div>
    </div>
  );
}

// ─── Progress Card (in-progress course) ──────────────────────
function ProgressCard({ course, progress, onClaim, claiming }) {
  const viewed = progress?.filter((l) => l.viewed).length || 0;
  const total = course.lectures?.length || 0;
  const pct = total > 0 ? Math.round((viewed / total) * 100) : 0;
  const eligible = pct === 100;

  return (
    <div className={`card p-4 border ${eligible ? "border-emerald-500/20" : "border-white/5"}`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl overflow-hidden bg-navy-800 flex-shrink-0">
          {course.courseThumbnail
            ? <img src={course.courseThumbnail} alt={course.courseTitle} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center"><BookOpen size={15} className="text-white/20" /></div>
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{course.courseTitle}</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${eligible ? "bg-emerald-400" : "bg-azure-400"}`}
                style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs text-white/40 flex-shrink-0">{pct}%</span>
          </div>
        </div>
        {eligible ? (
          <button onClick={() => onClaim(course._id)} disabled={claiming}
            className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5 disabled:opacity-60 flex-shrink-0">
            {claiming
              ? <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
              : <Award size={12} />
            }
            Claim
          </button>
        ) : (
          <span className="text-xs text-white/25 flex-shrink-0">{pct}% done</span>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function CertificatePage() {
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState([]);
  const [inProgressCourses, setInProgressCourses] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [backfilling, setBackfilling] = useState(false);
  const [claiming, setClaiming] = useState(null);
  const [verifyId, setVerifyId] = useState("");
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifying, setVerifying] = useState(false);

  const loadData = async () => {
    try {
      const [certRes, profileRes] = await Promise.allSettled([
        axios.get("/api/v1/certificate/my", { withCredentials: true }),
        axios.get("/api/v1/user/enrolled-courses", { withCredentials: true }),
      ]);

      const certs = certRes.status === "fulfilled" ? certRes.value.data.certificates || [] : [];
      setCertificates(certs);

      // enrolled-courses returns courses with lectures populated
      const enrolled = profileRes.status === "fulfilled"
        ? profileRes.value.data.courses || []
        : [];

      const certCourseIds = new Set(certs.map((c) => c.course?._id?.toString()));

      // Fetch progress for courses not yet certified
      const progressResults = await Promise.allSettled(
        enrolled
          .filter((c) => !certCourseIds.has(c._id?.toString()))
          .map((c) =>
            axios.get(`/api/v1/progress/${c._id}`, { withCredentials: true })
              .then((r) => ({ courseId: c._id, progress: r.data.data?.progress || [] }))
          )
      );

      const pm = {};
      progressResults.forEach((r) => {
        if (r.status === "fulfilled") pm[r.value.courseId] = r.value.progress;
      });
      setProgressMap(pm);
      setInProgressCourses(enrolled.filter((c) => !certCourseIds.has(c._id?.toString())));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // Backfill: issue certificates for all already-completed courses
  const handleBackfill = async () => {
    setBackfilling(true);
    try {
      const { data } = await axios.post(
        "/api/v1/progress/backfill-certificates",
        {},
        { withCredentials: true }
      );
      if (data.success) {
        toast.success(
          data.issued > 0
            ? `🎓 ${data.issued} certificate${data.issued > 1 ? "s" : ""} issued for your completed courses!`
            : "All completed courses already have certificates."
        );
        await loadData(); // Refresh
      }
    } catch {
      toast.error("Failed to issue certificates. Try again.");
    } finally {
      setBackfilling(false);
    }
  };

  const handleClaim = async (courseId) => {
    setClaiming(courseId);
    try {
      const { data } = await axios.post(
        `/api/v1/certificate/generate/${courseId}`,
        {},
        { withCredentials: true }
      );
      if (data.success) {
        toast.success("🎓 Certificate issued!");
        await loadData();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to generate certificate");
    } finally {
      setClaiming(null);
    }
  };

  const handleVerify = async () => {
    if (!verifyId.trim()) return;
    setVerifying(true);
    setVerifyResult(null);
    try {
      const { data } = await axios.get(`/api/v1/certificate/verify/${verifyId.trim()}`);
      setVerifyResult({ success: true, cert: data.certificate });
    } catch {
      setVerifyResult({ success: false });
    } finally {
      setVerifying(false);
    }
  };

  // Courses eligible for certificate but not yet claimed
  const eligibleUnclaimed = inProgressCourses.filter((c) => {
    const prog = progressMap[c._id];
    const viewed = prog?.filter((l) => l.viewed).length || 0;
    const total = c.lectures?.length || 0;
    return total > 0 && viewed >= total;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="section-title flex items-center gap-2">
            <Award size={22} className="text-amber-400" /> My Certificates
          </h1>
          <p className="text-white/35 text-sm mt-1">Earn a certificate by completing 100% of a course</p>
        </div>
        {/* Backfill button — issues certs for already-completed courses */}
        <button
          onClick={handleBackfill}
          disabled={backfilling}
          className="flex items-center gap-2 btn-secondary text-sm disabled:opacity-60"
          title="Issue certificates for all courses you already completed before this feature was added"
        >
          {backfilling
            ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <CheckCircle size={14} className="text-emerald-400" />
          }
          {backfilling ? "Checking…" : "Issue Missing Certificates"}
        </button>
      </div>

      {/* Info banner about backfill */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/8 border border-amber-500/20">
        <Award size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
        <div className="text-white/55 text-sm leading-relaxed">
          <strong className="text-white">Already completed courses before this feature?</strong> Click{" "}
          <strong className="text-amber-400">"Issue Missing Certificates"</strong> above to automatically get all certificates for courses you've already finished.
          Going forward, certificates are issued <strong className="text-white">automatically</strong> when you complete a course.
        </div>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-56 rounded-2xl shimmer" />)}
        </div>
      ) : (
        <>
          {/* Eligible but unclaimed */}
          {eligibleUnclaimed.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <CheckCircle size={14} /> Ready to Claim ({eligibleUnclaimed.length})
              </h2>
              <div className="space-y-3">
                {eligibleUnclaimed.map((c) => (
                  <ProgressCard key={c._id} course={c} progress={progressMap[c._id]}
                    onClaim={handleClaim} claiming={claiming === c._id} />
                ))}
              </div>
            </div>
          )}

          {/* Earned certificates */}
          {certificates.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3 flex items-center gap-2">
                <CheckCircle size={14} className="text-emerald-400" /> Earned ({certificates.length})
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {certificates.map((cert) => <CertCard key={cert._id} cert={cert} />)}
              </div>
            </div>
          )}

          {/* In-progress */}
          {inProgressCourses.filter((c) => !eligibleUnclaimed.find((e) => e._id === c._id)).length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Clock size={14} className="text-azure-400" /> In Progress
              </h2>
              <div className="space-y-3">
                {inProgressCourses
                  .filter((c) => !eligibleUnclaimed.find((e) => e._id === c._id))
                  .map((c) => (
                    <ProgressCard key={c._id} course={c} progress={progressMap[c._id]}
                      onClaim={handleClaim} claiming={claiming === c._id} />
                  ))}
              </div>
            </div>
          )}

          {certificates.length === 0 && inProgressCourses.length === 0 && (
            <div className="card flex flex-col items-center justify-center py-16 text-center">
              <Award size={40} className="text-white/10 mb-4" />
              <p className="text-white/30 font-medium">No certificates yet</p>
              <p className="text-white/20 text-sm mt-1">Enroll in and complete a course to earn your first certificate</p>
              <button onClick={() => navigate("/courses")} className="btn-primary text-sm mt-4 flex items-center gap-1">
                <BookOpen size={13} /> Browse Courses
              </button>
            </div>
          )}
        </>
      )}

      {/* Verifier */}
      <div className="card p-6 border border-white/6">
        <h2 className="font-semibold text-white text-sm mb-1 flex items-center gap-2">
          <Search size={15} className="text-azure-400" /> Verify a Certificate
        </h2>
        <p className="text-white/30 text-xs mb-4">Enter a certificate ID to verify its authenticity</p>
        <div className="flex gap-2">
          <input className="input flex-1 text-sm" placeholder="e.g. CERT-AB12CD-1234567890"
            value={verifyId} onChange={(e) => setVerifyId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleVerify()} />
          <button onClick={handleVerify} disabled={verifying || !verifyId.trim()}
            className="btn-primary text-sm px-4 disabled:opacity-50">
            {verifying ? "Checking…" : "Verify"}
          </button>
        </div>
        {verifyResult && (
          <div className={`mt-4 p-4 rounded-xl border ${
            verifyResult.success ? "bg-emerald-500/8 border-emerald-500/20" : "bg-rose-500/8 border-rose-500/20"
          }`}>
            {verifyResult.success ? (
              <div className="flex items-start gap-3">
                <CheckCircle size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-emerald-300 text-sm font-medium">✅ Valid Certificate</p>
                  <p className="text-white/50 text-xs mt-1">
                    <strong className="text-white">{verifyResult.cert.student?.name}</strong> completed{" "}
                    <strong className="text-white">{verifyResult.cert.course?.courseTitle}</strong>
                  </p>
                  <p className="text-white/30 text-xs mt-0.5">
                    Issued: {format(new Date(verifyResult.cert.issuedAt), "MMMM d, yyyy")}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <ExternalLink size={16} className="text-rose-400 flex-shrink-0" />
                <p className="text-rose-300 text-sm">❌ Certificate not found or invalid ID</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}