import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion } from "framer-motion";

export default function PortfolioStats({ holdings, transactions }) {
  const totalValue = holdings?.reduce((acc, h) => {
    const price = h.current_price || h.average_cost || 0;
    return acc + (h.quantity * price);
  }, 0) || 0;

  const totalCost = holdings?.reduce((acc, h) => {
    return acc + (h.quantity * (h.average_cost || 0));
  }, 0) || 0;

  const totalGain = totalValue - totalCost;
  const gainPercent = totalCost > 0 ? ((totalGain / totalCost) * 100) : 0;
  const isPositive = totalGain >= 0;

  const todayTransactions = transactions?.filter(t => {
    const today = new Date().toDateString();
    return new Date(t.created_date).toDateString() === today;
  }) || [];

  const todayVolume = todayTransactions.reduce((acc, t) => acc + (t.total_value || 0), 0);

  const stats = [
    {
      label: "Total Balance",
      value: `$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: Wallet,
      change: null,
      gradient: "from-blue-500/20 to-blue-600/5"
    },
    {
      label: "Total P&L",
      value: `${isPositive ? '+' : ''}$${totalGain.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: isPositive ? TrendingUp : TrendingDown,
      change: `${isPositive ? '+' : ''}${gainPercent.toFixed(2)}%`,
      isPositive,
      gradient: isPositive ? "from-emerald-500/20 to-emerald-600/5" : "from-red-500/20 to-red-600/5"
    },
    {
      label: "Today's Volume",
      value: `$${todayVolume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: ArrowUpRight,
      change: `${todayTransactions.length} trades`,
      gradient: "from-violet-500/20 to-violet-600/5"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className={`relative overflow-hidden border-0 bg-gradient-to-br ${stat.gradient} backdrop-blur-xl`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-slate-400">{stat.label}</span>
                <div className="p-2 rounded-xl bg-white/10">
                  <stat.icon className={`w-4 h-4 ${stat.isPositive === false ? 'text-red-400' : stat.isPositive ? 'text-emerald-400' : 'text-blue-400'}`} />
                </div>
              </div>
              <div className="space-y-1">
                <p className={`text-2xl font-bold tracking-tight ${stat.isPositive === false ? 'text-red-400' : stat.isPositive ? 'text-emerald-400' : 'text-slate-100'}`}>
                  {stat.value}
                </p>
                {stat.change && (
                  <p className={`text-sm ${stat.isPositive === false ? 'text-red-400/70' : stat.isPositive ? 'text-emerald-400/70' : 'text-slate-400'}`}>
                    {stat.change}
                  </p>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}