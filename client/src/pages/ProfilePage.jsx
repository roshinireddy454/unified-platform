import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";
import { User, Mail, Shield, Camera, Save, BookOpen } from "lucide-react";

export default function ProfilePage() {
  const { user, refetch } = useAuth();
  const [form, setForm] = useState({ name: user?.name || "" });
  const [photo, setPhoto] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!photo && form.name === user?.name) { toast("No changes to save"); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      if (photo) fd.append("profilePhoto", photo);
      await axios.put("/api/v1/user/profile/update", fd, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" }
      });
      await refetch();
      toast.success("Profile updated!");
      setPhoto(null);
    } catch (e) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const previewUrl = photo ? URL.createObjectURL(photo) : user?.photoUrl;

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title">Profile</h1>
        <p className="text-white/35 text-sm mt-1">Manage your account information</p>
      </div>

      <div className="card p-6">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-azure-500 to-emerald-500 flex items-center justify-center text-3xl font-semibold overflow-hidden">
              {previewUrl ? <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" /> : user?.name?.[0]?.toUpperCase()}
            </div>
            <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-azure-600 flex items-center justify-center cursor-pointer hover:bg-azure-500 transition-colors shadow-glow">
              <Camera size={14} className="text-white" />
              <input type="file" accept="image/*" className="hidden" onChange={e => setPhoto(e.target.files[0])} />
            </label>
          </div>
          <div className="mt-3 text-center">
            <div className="font-display text-lg font-medium text-white">{user?.name}</div>
            <div className={`mt-1 badge ${user?.role === "instructor" ? "badge-amber" : "badge-blue"} capitalize`}>{user?.role}</div>
          </div>
        </div>

        <div className="divider" />

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label flex items-center gap-1.5"><User size={12} /> Display Name</label>
            <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label flex items-center gap-1.5"><Mail size={12} /> Email Address</label>
            <input className="input opacity-50" value={user?.email || ""} disabled />
            <p className="text-xs text-white/25 mt-1">Email cannot be changed</p>
          </div>
          <div>
            <label className="label flex items-center gap-1.5"><Shield size={12} /> Account Role</label>
            <div className="input opacity-50 capitalize">{user?.role}</div>
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2">
            <Save size={15} /> {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

      {/* Stats */}
      <div className="card p-5">
        <h2 className="font-medium text-white mb-4">Account Stats</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-white/3 text-center">
            <div className="text-2xl font-display font-semibold text-azure-400">{user?.enrolledCourses?.length || 0}</div>
            <div className="text-xs text-white/35 mt-1 flex items-center justify-center gap-1"><BookOpen size={10} /> Courses</div>
          </div>
          <div className="p-4 rounded-xl bg-white/3 text-center">
            <div className="text-2xl font-display font-semibold text-emerald-400 capitalize">{user?.role}</div>
            <div className="text-xs text-white/35 mt-1">Account Type</div>
          </div>
        </div>
      </div>
    </div>
  );
}
