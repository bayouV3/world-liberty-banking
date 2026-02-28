import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Trophy, Coins, Users, Flame } from "lucide-react";
import { motion } from "framer-motion";
import LeaderboardRow from "@/components/showcase/LeaderboardRow";
import TopHolderCard from "@/components/showcase/TopHolderCard";

const FILTERS = ["All", "Diamond", "Gold", "Silver", "Bronze", "Collector"];

export default function TokenShowcase() {
  const [filter, setFilter] = useState("All");

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

  return (
    <div className="min-h-screen bg-[#060810] text-white">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1600&q=80"
          alt="Token Showcase"
          className="w-full h-64 object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#060810]/60 to-[#060810]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mb-3"
          >
            <div className="p-2 rounded-xl bg-yellow-500/20 border border-yellow-500/30">
              <Trophy className="w-6 h-6 text-yellow-400" />
            </div>
            <span className="text-yellow-400 font-semibold text-sm uppercase tracking-widest">Token Collector Showcase</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl font-black text-white mb-2 tracking-tight"
          >
            Top Holders
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-lg"
          >
            The most elite token collectors in the community
          </motion.p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 pb-16 -mt-4">
        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-4 mb-10"
        >
          {[
            { icon: Users, label: "Collectors", value: holders.length, color: "text-blue-400" },
            { icon: Coins, label: "Total Tokens", value: totalTokens.toLocaleString(), color: "text-yellow-400" },
            { icon: Flame, label: "Total Value", value: "$" + totalValue.toLocaleString(), color: "text-emerald-400" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-white/[0.03] border border-white/8 rounded-2xl p-4 text-center">
              <Icon className={`w-5 h-5 mx-auto mb-1 ${color}`} />
              <div className="text-xl font-bold text-white">{value}</div>
              <div className="text-xs text-slate-500">{label}</div>
            </div>
          ))}
        </motion.div>

        {/* Podium for top 3 */}
        {!isLoading && holders.length >= 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/[0.02] border border-white/8 rounded-3xl mb-8 overflow-hidden"
          >
            <div className="px-6 pt-6 pb-2">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Crown className="w-4 h-4 text-yellow-400" /> Podium
              </h2>
            </div>
            <TopHolderCard holders={holders.slice(0, 3)} />
          </motion.div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all
                ${filter === f
                  ? "bg-blue-600 border-blue-500 text-white"
                  : "bg-white/[0.03] border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.06]"
                }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Leaderboard */}
        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-20 rounded-2xl bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500">No holders found.</div>
        ) : (
          <div className="space-y-3">
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
  );
}