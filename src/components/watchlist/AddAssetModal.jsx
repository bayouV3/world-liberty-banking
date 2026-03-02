import { useState } from "react";
import { Search, X, Plus } from "lucide-react";
import { ALL_ASSETS } from "./useLivePrices";

const TYPE_COLORS = { stock: "#7eb3ff", crypto: "#d4a94a", forex: "#5ecb94" };
const TYPE_BG = { stock: "rgba(126,179,255,0.1)", crypto: "rgba(212,169,74,0.1)", forex: "rgba(94,203,148,0.1)" };

export default function AddAssetModal({ onAdd, onClose, existing = [] }) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = ALL_ASSETS.filter(a => {
    const existingSymbols = existing.map(e => e.symbol);
    if (existingSymbols.includes(a.symbol)) return false;
    if (typeFilter !== "all" && a.type !== typeFilter) return false;
    if (query) {
      const q = query.toLowerCase();
      return a.symbol.toLowerCase().includes(q) || a.name.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl" style={{ background: "linear-gradient(145deg, #232628, #1e2022)", border: "1px solid #3a3d42" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid #2e3236" }}>
          <h3 className="font-bold text-slate-100">Add to Watchlist</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 transition-colors" style={{ background: "rgba(255,255,255,0.04)" }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search symbol or name..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-slate-200 placeholder-slate-600 outline-none"
              style={{ background: "#161819", border: "1px solid #2e3236" }}
            />
          </div>

          {/* Type filters */}
          <div className="flex gap-2">
            {["all", "stock", "crypto", "forex"].map(t => (
              <button key={t} onClick={() => setTypeFilter(t)}
                className="px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all"
                style={{
                  background: typeFilter === t ? (TYPE_BG[t] || "rgba(255,255,255,0.08)") : "rgba(255,255,255,0.03)",
                  color: typeFilter === t ? (TYPE_COLORS[t] || "#e8eaec") : "#64748b",
                  border: `1px solid ${typeFilter === t ? (TYPE_COLORS[t] + "40" || "#44474c") : "transparent"}`
                }}>
                {t}
              </button>
            ))}
          </div>

          {/* Asset list */}
          <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
            {filtered.length === 0 ? (
              <p className="text-center text-slate-600 text-sm py-6">No assets found</p>
            ) : filtered.map(a => (
              <button key={a.symbol} onClick={() => onAdd(a)} className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid transparent" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{ background: TYPE_BG[a.type], color: TYPE_COLORS[a.type] }}>
                    {a.symbol.slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-200">{a.symbol}</p>
                    <p className="text-xs text-slate-500">{a.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-medium capitalize" style={{ background: TYPE_BG[a.type], color: TYPE_COLORS[a.type] }}>{a.type}</span>
                  <Plus className="w-4 h-4 text-slate-600" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}