import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  GraduationCap, Shield, Plus, Copy, CheckCircle2,
  Mail, Clock, Trash2, RefreshCw, ExternalLink, Eye, EyeOff,
} from "lucide-react";

function TokenCard({ t, baseUrl }) {
  const [copied, setCopied] = useState(false);
  const url  = `${baseUrl}/teacher-signup?token=${t.token}`;
  const copy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const expired = new Date() > new Date(t.expiresAt);
  const status  = t.used ? "used" : expired ? "expired" : "active";
  const statusColor = { used: "text-white/30 bg-white/5", expired: "text-amber-400 bg-amber-500/10", active: "text-emerald-400 bg-emerald-500/10" }[status];
  const statusLabel = { used: "Used", expired: "Expired", active: "Active" }[status];

  return (
    <div className={`p-4 rounded-xl border transition-all ${t.used ? "border-white/5 opacity-60" : expired ? "border-amber-500/20" : "border-emerald-500/20 bg-emerald-500/3"}`}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-sm font-medium text-white">{t.label || "Unnamed invite"}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor}`}>{statusLabel}</span>
          </div>
          <p className="text-xs text-white/30">
            Created {new Date(t.createdAt).toLocaleDateString()} ·{" "}
            Expires {new Date(t.expiresAt).toLocaleDateString()}
          </p>
          {t.usedBy && (
            <p className="text-xs text-white/40 mt-0.5">
              Used by: <span className="text-white/60">{t.usedBy.name} ({t.usedBy.email})</span>
            </p>
          )}
          <p className="text-xs text-white/20 mt-1 font-mono truncate">{t.token.slice(0, 20)}…</p>
        </div>
        {!t.used && !expired && (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button onClick={copy}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
                copied ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" : "bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10"
              }`}>
              {copied ? <><CheckCircle2 size={12} /> Copied!</> : <><Copy size={12} /> Copy Link</>}
            </button>
            <a href={url} target="_blank" rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/30 hover:text-white transition-all">
              <ExternalLink size={13} />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminInvitePage() {
  const [adminSecret,  setAdminSecret]  = useState("");
  const [showSecret,   setShowSecret]   = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [tokens,       setTokens]       = useState([]);
  const [loadingList,  setLoadingList]  = useState(false);

  const [form, setForm] = useState({ label: "", email: "", expiryDays: 7 });
  const [creating, setCreating] = useState(false);
  const [newToken, setNewToken] = useState(null);

  const BASE = window.location.origin;

  const loadTokens = async (secret) => {
    setLoadingList(true);
    try {
      const { data } = await axios.get("/api/v1/user/admin/invites", {
        headers: { "X-Admin-Secret": secret },
      });
      setTokens(data.tokens || []);
      setAuthenticated(true);
    } catch (err) {
      if (err.response?.status === 403) toast.error("Invalid admin secret.");
      else toast.error("Failed to load tokens.");
    } finally {
      setLoadingList(false);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    await loadTokens(adminSecret);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setNewToken(null);
    try {
      const { data } = await axios.post(
        "/api/v1/user/admin/invite",
        { label: form.label, email: form.email, expiryDays: Number(form.expiryDays) },
        { headers: { "X-Admin-Secret": adminSecret } }
      );
      toast.success("Invite token generated!");
      setNewToken(data);
      setForm({ label: "", email: "", expiryDays: 7 });
      loadTokens(adminSecret);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create token.");
    } finally {
      setCreating(false);
    }
  };

  // ── Login gate ─────────────────────────────────────────────
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-azure-500 to-azure-600 flex items-center justify-center">
              <GraduationCap size={20} className="text-white" />
            </div>
            <span className="font-display text-xl font-semibold text-white">Admin Panel</span>
          </div>

          <div className="bg-navy-900 border border-white/10 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                <Shield size={18} className="text-amber-400" />
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold text-white">Admin Access</h2>
                <p className="text-white/35 text-xs">Enter your admin secret to continue</p>
              </div>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="label">Admin Secret</label>
                <div className="relative">
                  <input
                    className="input pr-12"
                    type={showSecret ? "text" : "password"}
                    placeholder="Your ADMIN_SECRET from .env"
                    value={adminSecret}
                    onChange={(e) => setAdminSecret(e.target.value)}
                    required
                  />
                  <button type="button" onClick={() => setShowSecret((s) => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                    {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loadingList}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60">
                {loadingList ? <RefreshCw size={15} className="animate-spin" /> : <><Shield size={15} /> Enter Admin Panel</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ── Main admin panel ────────────────────────────────────────
  return (
    <div className="min-h-screen bg-navy-950 p-6">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-azure-500 to-azure-600 flex items-center justify-center">
              <GraduationCap size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-display text-xl font-semibold text-white">Teacher Invite Manager</h1>
              <p className="text-white/35 text-xs">Generate and manage instructor invite tokens</p>
            </div>
          </div>
          <button onClick={() => loadTokens(adminSecret)} disabled={loadingList}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl bg-white/5 border border-white/8 text-white/40 hover:text-white hover:bg-white/10 transition-all">
            <RefreshCw size={12} className={loadingList ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        {/* How it works */}
        <div className="bg-azure-500/8 border border-azure-500/20 rounded-2xl p-4">
          <p className="text-azure-300 text-sm font-medium mb-2">🔐 How teacher registration works</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-white/50">
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-azure-500/20 text-azure-400 flex items-center justify-center flex-shrink-0 font-bold text-xs">1</span>
              <span>Generate an invite token below (optionally auto-email it)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-azure-500/20 text-azure-400 flex items-center justify-center flex-shrink-0 font-bold text-xs">2</span>
              <span>Share the invite link with the teacher</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-azure-500/20 text-azure-400 flex items-center justify-center flex-shrink-0 font-bold text-xs">3</span>
              <span>Teacher signs up — token is single-use and expires automatically</span>
            </div>
          </div>
        </div>

        {/* Generate form */}
        <div className="bg-navy-900 border border-white/10 rounded-2xl p-6">
          <h2 className="font-display text-base font-semibold text-white mb-4 flex items-center gap-2">
            <Plus size={16} className="text-azure-400" /> Generate New Invite
          </h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Label / Teacher Name</label>
                <input className="input" type="text" placeholder="e.g. Physics Teacher"
                  value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
              </div>
              <div>
                <label className="label">Email <span className="text-white/25">(optional — auto-sends invite)</span></label>
                <input className="input" type="email" placeholder="teacher@school.com"
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            <div className="w-40">
              <label className="label">Expires after (days)</label>
              <input className="input" type="number" min={1} max={30}
                value={form.expiryDays} onChange={(e) => setForm({ ...form, expiryDays: e.target.value })} />
            </div>
            <button type="submit" disabled={creating}
              className="btn-primary flex items-center gap-2 text-sm disabled:opacity-60">
              {creating ? <RefreshCw size={14} className="animate-spin" /> : <Plus size={14} />}
              {creating ? "Generating…" : "Generate Invite Token"}
            </button>
          </form>

          {/* Newly created token */}
          {newToken && (
            <div className="mt-5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
              <p className="text-emerald-400 font-medium text-sm mb-2 flex items-center gap-2">
                <CheckCircle2 size={15} /> Token Created!{form.email ? " (Email sent to teacher)" : ""}
              </p>
              <p className="text-xs text-white/40 mb-2">Share this link with the teacher:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-black/30 rounded-lg px-3 py-2 text-emerald-300 break-all">
                  {newToken.inviteUrl}
                </code>
                <button onClick={() => { navigator.clipboard.writeText(newToken.inviteUrl); toast.success("Copied!"); }}
                  className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-all flex-shrink-0">
                  <Copy size={14} />
                </button>
              </div>
              <p className="text-xs text-white/25 mt-2 flex items-center gap-1">
                <Clock size={10} /> Expires: {new Date(newToken.expiresAt).toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {/* Token list */}
        <div className="bg-navy-900 border border-white/10 rounded-2xl p-6">
          <h2 className="font-display text-base font-semibold text-white mb-4 flex items-center gap-2">
            <Mail size={16} className="text-azure-400" /> All Invite Tokens
            <span className="text-xs text-white/30 font-normal ml-1">({tokens.length} total)</span>
          </h2>

          {loadingList ? (
            <div className="space-y-3">
              {[1,2,3].map((i) => <div key={i} className="h-16 rounded-xl shimmer" />)}
            </div>
          ) : tokens.length === 0 ? (
            <div className="text-center py-10">
              <Mail size={32} className="text-white/10 mx-auto mb-3" />
              <p className="text-white/30 text-sm">No invites generated yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tokens.map((t) => (
                <TokenCard key={t._id} t={t} baseUrl={BASE} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}