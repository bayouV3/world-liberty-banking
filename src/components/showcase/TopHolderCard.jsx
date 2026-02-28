import { motion } from "framer-motion";
import { Crown, TrendingUp, TrendingDown } from "lucide-react";

const podiumConfig = [
  { place: 2, height: "h-28", label: "2nd", color: "from-slate-400/20 to-slate-500/10", ring: "ring-slate-400/30", top: "mt-8" },
  { place: 1, height: "h-36", label: "1st", color: "from-yellow-400/25 to-yellow-500/10", ring: "ring-yellow-400/40", top: "mt-0" },
  { place: 3, height: "h-20", label: "3rd", color: "from-orange-400/20 to-orange-500/10", ring: "ring-orange-400/30", top: "mt-12" },
];

export default function TopHolderCard({ holders }) {
  // Arrange: 2nd, 1st, 3rd
  const ordered = [holders[1], holders[0], holders[2]].filter(Boolean);

  return (
    <div className="flex items-end justify-center gap-4 py-6">
      {podiumConfig.map((config, i) => {
        const holder = ordered[i];
        if (!holder) return null;
        const positive = (holder.change_24h ?? 0) >= 0;
        return (
          <motion.div
            key={holder.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15, duration: 0.5 }}
            className={`flex flex-col items-center ${config.top}`}
          >
            <div className="relative mb-3">
              {holder.avatar_url ? (
                <img src={holder.avatar_url} alt={holder.username}
                  className={`w-16 h-16 rounded-full object-cover ring-2 ${config.ring}`} />
              ) : (
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold text-2xl ring-2 ${config.ring}`}>
                  {holder.username?.[0]?.toUpperCase()}
                </div>
              )}
              {config.place === 1 && (
                <Crown className="absolute -top-4 left-1/2 -translate-x-1/2 w-6 h-6 text-yellow-400" />
              )}
            </div>
            <div className="text-white font-semibold text-sm truncate max-w-[80px] text-center">{holder.username}</div>
            <div className="text-xs text-slate-400">${holder.token_value_usd?.toLocaleString()}</div>
            <div className={`text-xs mt-0.5 ${positive ? "text-emerald-400" : "text-red-400"}`}>
              {positive ? "+" : ""}{holder.change_24h?.toFixed(1) ?? "0.0"}%
            </div>
            <div className={`mt-3 w-20 ${config.height} rounded-t-xl bg-gradient-to-b ${config.color} border border-white/10 flex items-center justify-center`}>
              <span className="text-white/60 font-black text-lg">{config.label}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}