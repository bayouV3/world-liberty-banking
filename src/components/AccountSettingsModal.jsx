import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Trash2, AlertTriangle, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AccountSettingsModal({ user, onClose }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      // Mark user deleted - in a real app this would call a backend function
      await base44.auth.updateMe({ role: "deleted" });
      base44.auth.logout("/");
    } catch {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: "linear-gradient(145deg, #1c1f24, #161921)", border: "1px solid #252930" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #1e2227" }}>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" style={{ color: "#818cf8" }} />
            <h2 className="text-white font-bold">Account Settings</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{ color: "#64748b", background: "rgba(255,255,255,0.04)" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* User info */}
          <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid #1e2227" }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
              {user?.full_name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "WF"}
            </div>
            <div>
              <p className="text-white font-semibold">{user?.full_name || "WorldFi User"}</p>
              <p className="text-slate-500 text-sm">{user?.email || ""}</p>
            </div>
          </div>

          {/* Logout */}
          <button onClick={() => base44.auth.logout("/")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid #1e2227", color: "#94a3b8" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}>
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Sign Out</span>
          </button>

          {/* Danger zone */}
          <div className="rounded-xl p-4" style={{ border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.04)" }}>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <h3 className="text-red-400 font-semibold text-sm">Danger Zone</h3>
            </div>

            {!confirmDelete ? (
              <button onClick={() => setConfirmDelete(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}>
                <Trash2 className="w-4 h-4" />
                Delete Account
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-slate-400 text-xs text-center">Are you sure? This action is <span className="text-red-400 font-semibold">irreversible</span> and all your data will be permanently deleted.</p>
                <div className="flex gap-2">
                  <button onClick={() => setConfirmDelete(false)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ background: "rgba(255,255,255,0.06)", color: "#94a3b8", border: "1px solid #252930" }}>
                    Cancel
                  </button>
                  <button onClick={handleDeleteAccount} disabled={deleting}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
                    style={{ background: "#dc2626", color: "white" }}>
                    {deleting ? "Deleting..." : "Yes, Delete"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}