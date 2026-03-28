import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { CheckCircle2, XCircle, Loader, GraduationCap, ArrowRight } from "lucide-react";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  const token          = searchParams.get("token");

  const [status, setStatus] = useState("verifying"); // verifying | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) { setStatus("error"); setMessage("No verification token found in the link."); return; }

    const verify = async () => {
      try {
        const { data } = await axios.get(`/api/v1/user/verify-email?token=${token}`);
        if (data.success) {
          setStatus("success");
          setMessage(data.message || "Email verified successfully!");
          // Auto-redirect after 3s
          setTimeout(() => navigate("/auth"), 3000);
        } else {
          setStatus("error");
          setMessage(data.message || "Verification failed.");
        }
      } catch (err) {
        setStatus("error");
        setMessage(err.response?.data?.message || "Verification failed. The link may have expired.");
      }
    };
    verify();
  }, [token]); // eslint-disable-line

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-10 justify-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-azure-500 to-azure-600 flex items-center justify-center shadow-glow">
            <GraduationCap size={20} className="text-white" />
          </div>
          <span className="font-display text-xl font-semibold text-white">LearnSphere</span>
        </div>

        <div className="bg-navy-900 border border-white/10 rounded-2xl p-10 text-center">
          {status === "verifying" && (
            <>
              <Loader size={48} className="text-azure-400 animate-spin mx-auto mb-5" />
              <h2 className="font-display text-xl font-semibold text-white mb-2">Verifying your email…</h2>
              <p className="text-white/40 text-sm">Please wait a moment.</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-20 h-20 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 size={40} className="text-emerald-400" />
              </div>
              <h2 className="font-display text-xl font-semibold text-white mb-3">Email Verified! 🎉</h2>
              <p className="text-white/50 text-sm mb-2">{message}</p>
              <p className="text-white/25 text-xs mb-8">Redirecting to login in a moment…</p>
              <Link to="/auth"
                className="btn-primary w-full flex items-center justify-center gap-2 text-sm">
                Continue to Login <ArrowRight size={15} />
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-20 h-20 rounded-full bg-rose-500/15 flex items-center justify-center mx-auto mb-5">
                <XCircle size={40} className="text-rose-400" />
              </div>
              <h2 className="font-display text-xl font-semibold text-white mb-3">Verification Failed</h2>
              <p className="text-white/50 text-sm mb-8 leading-relaxed">{message}</p>
              <div className="space-y-3">
                <Link to="/auth"
                  className="btn-primary w-full flex items-center justify-center gap-2 text-sm">
                  Back to Login
                </Link>
                <p className="text-white/25 text-xs">
                  Need a new link? Sign in and we'll help you resend it.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}