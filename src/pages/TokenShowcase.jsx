import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Trophy, Coins, Users, Flame, Crown, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import LeaderboardRow from "@/components/showcase/LeaderboardRow";
import TopHolderCard from "@/components/showcase/TopHolderCard";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import PullToRefresh from "@/components/PullToRefresh";

const FILTERS = ["All", "Diamond", "Gold", "Silver", "Bronze", "Collector"];

export default function TokenShowcase() {
  const [filter, setFilter] = useState("All");
  const queryClient = useQueryClient();

  const { data: holders = [], isLoading } = useQuery({
    queryKey: ["token_holders"],
    queryFn: () => base44.entities.TokenHolder.list("-tokens_held"),
    initialData: [],
  });

  const filtered = filter === "All"
    ? holders
    : holders.filter(h => h.badge?.toLowerCase() === filter.toLowerCase());

  const totalTokens = holders.reduce((s, h) => s + (h.tokens_held ?? 0), 0);
  const totalValue = holders.reduce((s, h) => s + (h.token_value_usd ?? 0), 0);

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["token_holders"] });
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen text-white" style={{ background: "#1a1c1e" }}>
      {/* ── Header ──────────────────────────────────────── */}
      <div className="relative px-5 pt-8 pb-10 overflow-hidden"
        style={{ background: "linear-gradient(145deg, #232628, #1e2022)", borderBottom: "1px solid #3a3d42" }}>
        <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)" }} />
        <div className="max-w-4xl mx-auto relative z-10">
          <Link to={createPageUrl("Dashboard")} className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-5 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Link>
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-xl" style={{ background: "linear-gradient(145deg, #333740, #282b2f)", border: "1px solid #44474c" }}>
              <Trophy className="w-5 h-5 text-slate-300" />
            </div>
            <span className="text-slate-400 font-semibold text-xs uppercase tracking-[0.15em]">Token Collector Showcase</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
            Top Holders
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="text-slate-500">
            The most elite token collectors in the WorldFi community
          </motion.p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-5 pb-16 -mt-2 space-y-6">
        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="grid grid-cols-3 gap-3">
          {[
            { icon: Users, label: "Collectors", value: holders.length, color: "#adb5bd", bg: "linear-gradient(145deg, #333740, #282b2f)" },
            { icon: Coins, label: "Total Tokens", value: totalTokens.toLocaleString(), color: "#d4a94a", bg: "linear-gradient(145deg, #333740, #282b2f)" },
            { icon: Flame, label: "Total Value", value: "$" + (totalValue / 1000).toFixed(1) + "K", color: "#5ecb94", bg: "linear-gradient(145deg, #333740, #282b2f)" },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className="rounded-2xl p-4 text-center" style={{ background: "linear-gradient(145deg, #2a2d30, #202326)", border: "1px solid #44474c" }}>
              <div className="w-9 h-9 rounded-xl mx-auto mb-2 flex items-center justify-center" style={{ background: bg, border: "1px solid #44474c" }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <div className="text-lg font-bold text-white">{value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{label}</div>
            </div>
          ))}
        </motion.div>

        {/* Podium */}
        {!isLoading && holders.length >= 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(145deg, #232628, #1e2022)", border: "1px solid #3a3d42" }}>
            <div className="px-5 pt-5 pb-2 flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-bold text-slate-300 uppercase tracking-widest text-xs">Podium</span>
            </div>
            <TopHolderCard holders={holders.slice(0, 3)} />
          </motion.div>
        )}

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
              style={filter === f
                ? { background: "linear-gradient(145deg, #4a4e57, #35383d)", border: "1px solid #555960", color: "#e8eaec" }
                : { background: "transparent", border: "1px solid #2e3236", color: "#64748b" }
              }>
              {f}
            </button>
          ))}
        </div>

        {/* Leaderboard */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: "#232628" }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-600">No holders in this tier.</div>
        ) : (
          <div className="space-y-2">
            {filtered.map((holder, i) => (
              <LeaderboardRow
                key={holder.id}
                holder={holder}
                index={holders.indexOf(holder)}
                delay={i * 0.04}
              />
            ))}
          </div>
        )}
      </div>
    </div>
    </PullToRefresh>
  );
}