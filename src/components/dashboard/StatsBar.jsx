import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Activity, DollarSign, BarChart2, Shield } from "lucide-react";

export default function StatsBar({ positions, balance }) {
  const totalValue = positions.reduce((acc, p) => acc + (p.quantity || 0) * (p.current_price || p.avg_cost || 0), 0);
  const totalCost = positions.reduce((acc, p) => acc + (p.quantity || 0) * (p.avg_cost || 0), 0);
  const pnl = totalValue - totalCost;
  const pnlPct = totalCost > 0 ? (pnl / totalCost) * 100 : 0;
  const cashBalance = balance?.amount || 0;

  const stats = [
    {
      label: "Invested",
      value: `$${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      iconColor: "text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Total P&L",
      value: `${pnl >= 0 ? '+' : ''}$${Math.abs(pnl).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      sub: `${pnlPct >= 0 ? '+' : ''}${pnlPct.toFixed(2)}%`,
      icon: pnl >= 0 ? TrendingUp : TrendingDown,
      iconColor: pnl >= 0 ? "text-emerald-400" : "text-red-400",
      bgColor: pnl >= 0 ? "bg-emerald-500/10" : "bg-red-500/10",
      valueColor: pnl >= 0 ? "text-emerald-400" : "text-red-400",
    },
    {
      label: "Positions",
      value: positions.length.toString(),
      sub: "Active assets",
      icon: BarChart2,
      iconColor: "text-violet-400",
      bgColor: "bg-violet-500/10",
    },
    {
      label: "Cash Ready",
      value: `$${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      sub: "Deployable",
      icon: Shield,
      iconColor: "text-amber-400",
      bgColor: "bg-amber-500/10",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 -mt-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur px-5 py-4 flex items-center gap-4"
          >
            <div className={`w-10 h-10 rounded-xl ${s.bgColor} flex items-center justify-center shrink-0`}>
              <s.icon className={`w-5 h-5 ${s.iconColor}`} />
            </div>
            <div>
              <p className="text-xs text-slate-400">{s.label}</p>
              <p className={`text-lg font-bold ${s.valueColor || 'text-white'}`}>{s.value}</p>
              {s.sub && <p className="text-xs text-slate-500">{s.sub}</p>}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}