import { motion } from "framer-motion";
import { TrendingUp, ArrowUpRight, Globe } from "lucide-react";

export default function HeroBanner({ user, balance, positions }) {
  const totalValue = positions.reduce((acc, p) => acc + (p.quantity || 0) * (p.current_price || p.avg_cost || 0), 0);
  const cashBalance = balance?.amount || 0;
  const netWorth = totalValue + cashBalance;

  return (
    <div className="relative overflow-hidden">
      {/* Background image layer */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1639322537228-f710d846310a?w=1600&q=80')`,
        }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#060810]/80 via-[#060810]/70 to-[#060810]" />
      {/* Blue glow */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-violet-600/15 rounded-full blur-3xl" />

      <div className="relative max-w-6xl mx-auto px-4 md:px-8 pt-12 pb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          {/* Left: greeting & net worth */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400 text-sm font-medium tracking-wide uppercase">World Liberty Financial</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-2">
              {user?.full_name ? `Welcome back, ${user.full_name.split(' ')[0]}` : 'Your Portfolio'}
            </h1>
            <p className="text-slate-400 text-lg">DeFi meets TradFi — your wealth, unified.</p>

            <div className="mt-8">
              <p className="text-slate-400 text-sm mb-1">Total Net Worth</p>
              <div className="flex items-end gap-3">
                <span className="text-5xl font-black text-white tracking-tight">
                  ${netWorth.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
                <span className="flex items-center gap-1 text-emerald-400 text-sm font-semibold mb-2">
                  <ArrowUpRight className="w-4 h-4" />
                  Live
                </span>
              </div>
            </div>
          </motion.div>

          {/* Right: mini cards */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex gap-4 flex-wrap"
          >
            <MiniCard
              label="Cash Balance"
              value={`$${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              sub="Available"
              color="from-emerald-500/20 to-emerald-600/10 border-emerald-500/30"
              textColor="text-emerald-300"
            />
            <MiniCard
              label="Portfolio Value"
              value={`$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              sub={`${positions.length} positions`}
              color="from-blue-500/20 to-blue-600/10 border-blue-500/30"
              textColor="text-blue-300"
            />
          </motion.div>
        </div>

        {/* Ticker strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-10 flex items-center gap-6 overflow-x-auto pb-2 scrollbar-hide"
        >
          {TICKERS.map((t) => (
            <div key={t.symbol} className="flex items-center gap-2 shrink-0 bg-white/5 border border-white/10 rounded-full px-4 py-2">
              <span className="text-xs font-bold text-slate-300">{t.symbol}</span>
              <span className="text-xs text-white font-semibold">{t.price}</span>
              <span className={`text-xs font-medium ${t.up ? 'text-emerald-400' : 'text-red-400'}`}>
                {t.up ? '▲' : '▼'} {t.change}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

function MiniCard({ label, value, sub, color, textColor }) {
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${color} border backdrop-blur-lg px-5 py-4 min-w-[150px]`}>
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className={`text-xl font-bold ${textColor}`}>{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
    </div>
  );
}

const TICKERS = [
  { symbol: "BTC", price: "$97,420", change: "2.4%", up: true },
  { symbol: "ETH", price: "$3,218", change: "1.8%", up: true },
  { symbol: "WLFI", price: "$0.048", change: "5.2%", up: true },
  { symbol: "SOL", price: "$184", change: "0.9%", up: false },
  { symbol: "BNB", price: "$592", change: "1.1%", up: true },
  { symbol: "AAPL", price: "$225", change: "0.4%", up: true },
  { symbol: "TSLA", price: "$398", change: "3.2%", up: false },
];