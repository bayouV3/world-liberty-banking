import { useState, useEffect, useRef } from "react";
import { Search, X, User, TrendingUp } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const ASSETS = [
  { symbol: "BTC", name: "Bitcoin", type: "crypto" },
  { symbol: "ETH", name: "Ethereum", type: "crypto" },
  { symbol: "SOL", name: "Solana", type: "crypto" },
  { symbol: "BNB", name: "BNB", type: "crypto" },
  { symbol: "ADA", name: "Cardano", type: "crypto" },
  { symbol: "DOGE", name: "Dogecoin", type: "crypto" },
  { symbol: "AAPL", name: "Apple Inc.", type: "stock" },
  { symbol: "GOOGL", name: "Alphabet Inc.", type: "stock" },
  { symbol: "MSFT", name: "Microsoft", type: "stock" },
  { symbol: "TSLA", name: "Tesla", type: "stock" },
  { symbol: "AMZN", name: "Amazon", type: "stock" },
  { symbol: "NVDA", name: "NVIDIA", type: "stock" },
  { symbol: "META", name: "Meta Platforms", type: "stock" },
];

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [holders, setHolders] = useState([]);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  // Load token holders once on open
  useEffect(() => {
    if (open && holders.length === 0) {
      base44.entities.TokenHolder.list().then(setHolders).catch(() => {});
    }
  }, [open]);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const q = query.toLowerCase().trim();

  const matchedAssets = q
    ? ASSETS.filter(a => a.symbol.toLowerCase().includes(q) || a.name.toLowerCase().includes(q))
    : [];

  const matchedHolders = q
    ? holders.filter(h => h.username?.toLowerCase().includes(q) || h.favorite_token?.toLowerCase().includes(q))
    : [];

  const hasResults = matchedAssets.length > 0 || matchedHolders.length > 0;

  const goToShowcase = () => {
    navigate(createPageUrl("TokenShowcase"));
    setOpen(false);
    setQuery("");
  };

  const goToWatchlist = () => {
    navigate(createPageUrl("Watchlist"));
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Search trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 h-8 rounded-lg text-sm transition-all"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #1e2227", color: "#64748b" }}
      >
        <Search className="w-3.5 h-3.5" />
        <span className="hidden sm:inline text-xs">Search...</span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-[60]"
              style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setOpen(false); setQuery(""); }}
            />

            {/* Search panel */}
            <motion.div
              className="fixed left-1/2 z-[70] w-full max-w-lg"
              style={{ top: "72px", transform: "translateX(-50%)" }}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              <div className="mx-4 rounded-2xl overflow-hidden shadow-2xl"
                style={{ background: "#1a1d21", border: "1px solid #2a2d32" }}>

                {/* Input row */}
                <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: "1px solid #2a2d32" }}>
                  <Search className="w-4 h-4 shrink-0" style={{ color: "#64748b" }} />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search assets, holders..."
                    className="flex-1 bg-transparent outline-none text-sm"
                    style={{ color: "#e2e8f0" }}
                  />
                  {query && (
                    <button onClick={() => setQuery("")}>
                      <X className="w-4 h-4" style={{ color: "#64748b" }} />
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {!q && (
                    <div className="px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "#3a4048" }}>
                      Start typing to search
                    </div>
                  )}

                  {q && !hasResults && (
                    <div className="px-4 py-6 text-center text-sm" style={{ color: "#64748b" }}>
                      No results for "{query}"
                    </div>
                  )}

                  {matchedAssets.length > 0 && (
                    <div>
                      <div className="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-wider" style={{ color: "#3a4048" }}>
                        Assets
                      </div>
                      {matchedAssets.map(asset => (
                        <button
                          key={asset.symbol}
                          onClick={goToWatchlist}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all"
                          style={{ color: "#c8ced6" }}
                          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold"
                            style={{ background: asset.type === "crypto" ? "rgba(99,102,241,0.15)" : "rgba(251,191,36,0.15)", color: asset.type === "crypto" ? "#818cf8" : "#fbbf24" }}>
                            {asset.symbol.slice(0, 2)}
                          </div>
                          <div>
                            <div className="text-sm font-medium" style={{ color: "#e2e8f0" }}>{asset.symbol}</div>
                            <div className="text-xs" style={{ color: "#64748b" }}>{asset.name}</div>
                          </div>
                          <div className="ml-auto">
                            <span className="text-xs px-2 py-0.5 rounded-full capitalize"
                              style={{ background: "rgba(255,255,255,0.05)", color: "#64748b" }}>
                              {asset.type}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {matchedHolders.length > 0 && (
                    <div>
                      <div className="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-wider" style={{ color: "#3a4048" }}>
                        Token Holders
                      </div>
                      {matchedHolders.map(holder => (
                        <button
                          key={holder.id}
                          onClick={goToShowcase}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all"
                          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                          <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                            style={{ background: "rgba(139,92,246,0.15)", color: "#a78bfa" }}>
                            {holder.username?.slice(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-medium" style={{ color: "#e2e8f0" }}>{holder.username}</div>
                            <div className="text-xs" style={{ color: "#64748b" }}>
                              {holder.tokens_held?.toLocaleString()} tokens
                              {holder.favorite_token ? ` · ${holder.favorite_token}` : ""}
                            </div>
                          </div>
                          {holder.badge && (
                            <div className="ml-auto text-xs px-2 py-0.5 rounded-full capitalize"
                              style={{ background: "rgba(255,255,255,0.05)", color: "#64748b" }}>
                              {holder.badge}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}