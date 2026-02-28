import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Crown, Medal } from "lucide-react";

const badgeConfig = {
  diamond: { label: "Diamond", color: "text-cyan-300", bg: "bg-cyan-500/15 border-cyan-500/30", glow: "shadow-cyan-500/20" },
  gold: { label: "Gold", color: "text-yellow-300", bg: "bg-yellow-500/15 border-yellow-500/30", glow: "shadow-yellow-500/20" },
  silver: { label: "Silver", color: "text-slate-300", bg: "bg-slate-400/15 border-slate-400/30", glow: "shadow-slate-400/20" },
  bronze: { label: "Bronze", color: "text-orange-400", bg: "bg-orange-500/15 border-orange-500/30", glow: "shadow-orange-500/20" },
  collector: { label: "Collector", color: "text-purple-300", bg: "bg-purple-500/15 border-purple-500/30", glow: "shadow-purple-500/20" },
};

const rankColors = ["text-yellow-400", "text-slate-300", "text-orange-400"];

export default function LeaderboardRow({ holder, index, delay }) {
  const badge = badgeConfig[holder.badge] || badgeConfig.collector;
  const isTop3 = index < 3;
  const positive = (holder.change_24h ?? 0) >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.35 }}
      className={`flex items-center gap-4 p-4 rounded-2xl border transition-all hover:scale-[1.01] cursor-default
        ${isTop3
          ? "bg-gradient-to-r from-white/5 to-white/[0.02] border-white/10 shadow-lg " + badge.glow
          : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04]"
        }`}
    >
      {/* Rank */}
      <div className={`w-10 text-center font-black text-lg shrink-0 ${rankColors[index] ?? "text-slate-500"}`}>
        {index === 0 ? <Crown className="w-6 h-6 mx-auto text-yellow-400" /> :
         index === 1 ? <Medal className="w-5 h-5 mx-auto text-slate-300" /> :
         index === 2 ? <Medal className="w-5 h-5 mx-auto text-orange-400" /> :
         `#${index + 1}`}
      </div>

      {/* Avatar */}
      <div className="relative shrink-0">
        {holder.avatar_url ? (
          <img src={holder.avatar_url} alt={holder.username} className="w-11 h-11 rounded-full object-cover ring-2 ring-white/10" />
        ) : (
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg">
            {holder.username?.[0]?.toUpperCase() ?? "?"}
          </div>
        )}
        {isTop3 && <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-yellow-400 border-2 border-slate-950" />}
      </div>

      {/* Name & badge */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white truncate">{holder.username}</span>
          {holder.badge && (
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${badge.bg} ${badge.color}`}>
              {badge.label}
            </span>
          )}
        </div>
        <div className="text-xs text-slate-500 mt-0.5">
          {holder.favorite_token ? `Favorite: ${holder.favorite_token}` : "Token Collector"}
        </div>
      </div>

      {/* Tokens */}
      <div className="text-right shrink-0">
        <div className="text-white font-bold">{holder.tokens_held?.toLocaleString()}</div>
        <div className="text-xs text-slate-500">tokens</div>
      </div>

      {/* Value */}
      <div className="text-right shrink-0 hidden sm:block">
        <div className="text-white font-semibold">${holder.token_value_usd?.toLocaleString()}</div>
        <div className={`text-xs flex items-center justify-end gap-0.5 ${positive ? "text-emerald-400" : "text-red-400"}`}>
          {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {positive ? "+" : ""}{holder.change_24h?.toFixed(2) ?? "0.00"}%
        </div>
      </div>
    </motion.div>
  );
}