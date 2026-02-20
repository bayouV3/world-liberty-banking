import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, BarChart2, ShieldCheck, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, ReferenceLine
} from "recharts";

const TIMEFRAMES = ["1D", "1W", "1M", "1Y", "All"];

// Simulated benchmark data alongside portfolio
function generateData(totalValue, timeframe) {
  const points = timeframe === "1D" ? 24 : timeframe === "1W" ? 7 : timeframe === "1M" ? 30 : timeframe === "1Y" ? 52 : 104;
  const data = [];
  let portfolioVal = totalValue * 0.78;
  let spVal = 100;
  let nasdaqVal = 100;

  for (let i = 0; i <= points; i++) {
    const pChange = (Math.random() - 0.46) * 0.03;
    const sChange = (Math.random() - 0.47) * 0.02;
    const nChange = (Math.random() - 0.46) * 0.025;
    portfolioVal *= (1 + pChange);
    spVal *= (1 + sChange);
    nasdaqVal *= (1 + nChange);

    const date = new Date();
    if (timeframe === "1D") {
      date.setHours(date.getHours() - (points - i));
    } else if (timeframe === "1W") {
      date.setDate(date.getDate() - (points - i));
    } else if (timeframe === "1M") {
      date.setDate(date.getDate() - (points - i));
    } else if (timeframe === "1Y") {
      date.setDate(date.getDate() - (points - i) * 7);
    } else {
      date.setDate(date.getDate() - (points - i) * 14);
    }

    const label = timeframe === "1D"
      ? `${date.getHours()}:00`
      : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    data.push({
      date: label,
      portfolio: Math.max(0, portfolioVal),
      sp500: spVal,
      nasdaq: nasdaqVal,
    });
  }

  // Normalize to same starting point as portfolio percentage
  const startPortfolio = data[0]?.portfolio || 1;
  return data.map(d => ({
    ...d,
    portfolioPct: ((d.portfolio - startPortfolio) / startPortfolio) * 100,
    sp500Pct: d.sp500 - 100,
    nasdaqPct: d.nasdaq - 100,
  }));
}

// Mock dividend data
const DIVIDEND_DATA = [
  { month: "Jan", yield: 1.2, payout: 45 },
  { month: "Feb", yield: 1.1, payout: 42 },
  { month: "Mar", yield: 1.4, payout: 52 },
  { month: "Apr", yield: 1.3, payout: 48 },
  { month: "May", yield: 1.5, payout: 56 },
  { month: "Jun", yield: 1.2, payout: 45 },
  { month: "Jul", yield: 1.6, payout: 60 },
  { month: "Aug", yield: 1.4, payout: 53 },
  { month: "Sep", yield: 1.5, payout: 57 },
  { month: "Oct", yield: 1.7, payout: 63 },
  { month: "Nov", yield: 1.8, payout: 68 },
  { month: "Dec", yield: 2.0, payout: 75 },
];

function calcRiskMetrics(data) {
  if (!data || data.length < 2) return { volatility: 0, sharpe: 0, beta: 0 };
  const returns = data.slice(1).map((d, i) => {
    const prev = data[i].portfolio;
    return prev > 0 ? (d.portfolio - prev) / prev : 0;
  });
  const avg = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((a, r) => a + Math.pow(r - avg, 2), 0) / returns.length;
  const volatility = Math.sqrt(variance) * Math.sqrt(252) * 100;
  const riskFreeRate = 0.05;
  const annualReturn = avg * 252;
  const sharpe = volatility > 0 ? ((annualReturn - riskFreeRate) / (volatility / 100)).toFixed(2) : "0.00";
  const beta = (0.8 + Math.random() * 0.5).toFixed(2);
  return { volatility: volatility.toFixed(1), sharpe, beta };
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs shadow-xl">
      <p className="text-slate-400 mb-2">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-300">{p.name}:</span>
          <span className="font-semibold" style={{ color: p.color }}>
            {p.value >= 0 ? "+" : ""}{typeof p.value === 'number' ? p.value.toFixed(2) : p.value}%
          </span>
        </div>
      ))}
    </div>
  );
};

export default function PortfolioStats({ holdings, transactions }) {
  const [timeframe, setTimeframe] = useState("1M");
  const [activeTab, setActiveTab] = useState("performance"); // performance | risk | dividends

  const totalValue = holdings?.reduce((acc, h) => {
    const price = h.current_price || h.average_cost || 0;
    return acc + (h.quantity * price);
  }, 0) || 12450;

  const totalCost = holdings?.reduce((acc, h) => acc + (h.quantity * (h.average_cost || 0)), 0) || 10000;
  const totalGain = totalValue - totalCost;
  const gainPercent = totalCost > 0 ? ((totalGain / totalCost) * 100) : 0;
  const isPositive = totalGain >= 0;

  const todayTransactions = transactions?.filter(t => {
    const today = new Date().toDateString();
    return new Date(t.created_date).toDateString() === today;
  }) || [];
  const todayVolume = todayTransactions.reduce((acc, t) => acc + (t.total_value || 0), 0);

  const chartData = useMemo(() => generateData(totalValue, timeframe), [totalValue, timeframe]);
  const riskMetrics = useMemo(() => calcRiskMetrics(chartData), [chartData]);

  const endPortfolio = chartData[chartData.length - 1]?.portfolioPct || 0;
  const endSP = chartData[chartData.length - 1]?.sp500Pct || 0;
  const endNasdaq = chartData[chartData.length - 1]?.nasdaqPct || 0;
  const vsSpDiff = (endPortfolio - endSP).toFixed(2);
  const vsNasdaqDiff = (endPortfolio - endNasdaq).toFixed(2);

  const tabs = [
    { id: "performance", label: "Performance", icon: TrendingUp },
    { id: "risk", label: "Risk Metrics", icon: ShieldCheck },
    { id: "dividends", label: "Dividends", icon: DollarSign },
  ];

  return (
    <div className="space-y-4">
      {/* Top stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Portfolio Value", value: `$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            sub: `${isPositive ? '+' : ''}${gainPercent.toFixed(2)}% all time`, color: "blue", Icon: Wallet, positive: isPositive
          },
          {
            label: "Total P&L", value: `${isPositive ? '+' : ''}$${Math.abs(totalGain).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            sub: `vs $${totalCost.toLocaleString('en-US', { maximumFractionDigits: 0 })} invested`, color: isPositive ? "emerald" : "red", Icon: isPositive ? TrendingUp : TrendingDown, positive: isPositive
          },
          {
            label: "Today's Volume", value: `$${todayVolume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            sub: `${todayTransactions.length} trades today`, color: "violet", Icon: BarChart2, positive: null
          },
          {
            label: "Sharpe Ratio", value: riskMetrics.sharpe,
            sub: `Volatility: ${riskMetrics.volatility}% ann.`, color: parseFloat(riskMetrics.sharpe) > 1 ? "emerald" : "orange", Icon: ShieldCheck, positive: parseFloat(riskMetrics.sharpe) > 1
          },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className={`relative overflow-hidden border border-white/5 bg-slate-900/60 backdrop-blur-xl`}>
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-slate-400">{stat.label}</span>
                  <div className={`p-1.5 rounded-lg bg-${stat.color}-500/15`}>
                    <stat.Icon className={`w-3.5 h-3.5 text-${stat.color}-400`} />
                  </div>
                </div>
                <p className={`text-xl font-bold tracking-tight text-${stat.color}-400`}>{stat.value}</p>
                <p className="text-xs text-slate-500 mt-1">{stat.sub}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Analytics card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="border border-white/5 bg-slate-900/60 backdrop-blur-xl overflow-hidden">
          {/* Tab bar */}
          <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/5">
            <div className="flex gap-1">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === id
                      ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {label}
                </button>
              ))}
            </div>

            {activeTab === "performance" && (
              <div className="flex gap-1">
                {TIMEFRAMES.map(tf => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                      timeframe === tf ? "bg-slate-700 text-white" : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-5">
            {/* PERFORMANCE TAB */}
            {activeTab === "performance" && (
              <div>
                {/* Benchmark comparison pills */}
                <div className="flex flex-wrap gap-3 mb-4">
                  {[
                    { label: "Your Portfolio", color: "#3B82F6", value: `${endPortfolio >= 0 ? "+" : ""}${endPortfolio.toFixed(2)}%` },
                    { label: "S&P 500", color: "#10B981", value: `${endSP >= 0 ? "+" : ""}${endSP.toFixed(2)}%`, diff: vsSpDiff },
                    { label: "Nasdaq", color: "#8B5CF6", value: `${endNasdaq >= 0 ? "+" : ""}${endNasdaq.toFixed(2)}%`, diff: vsNasdaqDiff },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
                      <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                      <span className="text-xs text-slate-400">{item.label}</span>
                      <span className="text-xs font-semibold" style={{ color: item.color }}>{item.value}</span>
                      {item.diff && (
                        <span className={`text-xs font-medium ml-1 ${parseFloat(item.diff) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                          ({parseFloat(item.diff) >= 0 ? "+" : ""}{item.diff}% vs index)
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10 }} interval="preserveStartEnd" />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10 }} tickFormatter={v => `${v.toFixed(1)}%`} />
                      <Tooltip content={<CustomTooltip />} />
                      <ReferenceLine y={0} stroke="#334155" strokeDasharray="3 3" />
                      <Line type="monotone" dataKey="portfolioPct" name="Portfolio" stroke="#3B82F6" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="sp500Pct" name="S&P 500" stroke="#10B981" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
                      <Line type="monotone" dataKey="nasdaqPct" name="Nasdaq" stroke="#8B5CF6" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* RISK TAB */}
            {activeTab === "risk" && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    {
                      label: "Volatility (Ann.)", value: `${riskMetrics.volatility}%`,
                      desc: riskMetrics.volatility < 15 ? "Low risk" : riskMetrics.volatility < 25 ? "Moderate risk" : "High risk",
                      color: riskMetrics.volatility < 15 ? "emerald" : riskMetrics.volatility < 25 ? "yellow" : "red",
                      pct: Math.min(100, (riskMetrics.volatility / 50) * 100)
                    },
                    {
                      label: "Sharpe Ratio", value: riskMetrics.sharpe,
                      desc: riskMetrics.sharpe > 2 ? "Excellent" : riskMetrics.sharpe > 1 ? "Good" : "Below average",
                      color: riskMetrics.sharpe > 2 ? "emerald" : riskMetrics.sharpe > 1 ? "blue" : "orange",
                      pct: Math.min(100, (riskMetrics.sharpe / 3) * 100)
                    },
                    {
                      label: "Beta (vs S&P 500)", value: riskMetrics.beta,
                      desc: riskMetrics.beta < 1 ? "Less volatile than market" : "More volatile than market",
                      color: riskMetrics.beta < 1 ? "emerald" : "orange",
                      pct: Math.min(100, (riskMetrics.beta / 2) * 100)
                    },
                  ].map(m => (
                    <div key={m.label} className="p-4 rounded-xl bg-white/5 border border-white/5">
                      <p className="text-xs text-slate-400 mb-1">{m.label}</p>
                      <p className={`text-2xl font-bold text-${m.color}-400`}>{m.value}</p>
                      <p className={`text-xs text-${m.color}-400/70 mt-1`}>{m.desc}</p>
                      <div className="mt-3 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full bg-${m.color}-500 rounded-full`} style={{ width: `${m.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <p className="text-xs text-slate-400 mb-3">Portfolio vs S&P 500 — Rolling Returns ({timeframe})</p>
                  <div className="flex gap-2 mb-3">
                    {TIMEFRAMES.map(tf => (
                      <button key={tf} onClick={() => setTimeframe(tf)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${timeframe === tf ? "bg-slate-700 text-white" : "text-slate-500 hover:text-slate-300"}`}
                      >{tf}</button>
                    ))}
                  </div>
                  <div className="h-[160px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="pfGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10 }} interval="preserveStartEnd" />
                        <YAxis hide />
                        <Tooltip content={<CustomTooltip />} />
                        <ReferenceLine y={0} stroke="#334155" strokeDasharray="3 3" />
                        <Area type="monotone" dataKey="portfolioPct" name="Portfolio" stroke="#3B82F6" strokeWidth={2} fill="url(#pfGrad)" dot={false} />
                        <Line type="monotone" dataKey="sp500Pct" name="S&P 500" stroke="#10B981" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* DIVIDENDS TAB */}
            {activeTab === "dividends" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2">
                  {[
                    { label: "Annual Yield", value: "1.47%", color: "emerald" },
                    { label: "Annual Payout", value: "$612", color: "blue" },
                    { label: "Next Ex-Date", value: "Mar 14", color: "violet" },
                    { label: "Paying Assets", value: `${Math.max(1, Math.floor((holdings?.length || 3) * 0.6))}`, color: "amber" },
                  ].map(s => (
                    <div key={s.label} className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                      <p className="text-xs text-slate-400 mb-1">{s.label}</p>
                      <p className={`text-xl font-bold text-${s.color}-400`}>{s.value}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <p className="text-xs text-slate-400 mb-3">Monthly Dividend Payout (USD)</p>
                  <div className="h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={DIVIDEND_DATA} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="divGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10 }} />
                        <YAxis hide />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '8px' }}
                          labelStyle={{ color: '#94A3B8' }}
                          formatter={(v, name) => name === "payout" ? [`$${v}`, "Payout"] : [`${v}%`, "Yield"]}
                        />
                        <Area type="monotone" dataKey="payout" name="payout" stroke="#10B981" strokeWidth={2} fill="url(#divGrad)" dot={false} />
                        <Line type="monotone" dataKey="yield" name="yield" stroke="#F59E0B" strokeWidth={1.5} strokeDasharray="4 2" dot={false} yAxisId="right" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-400 mb-2">Dividend-Paying Holdings</p>
                  <div className="space-y-2">
                    {[
                      { name: "Apple Inc.", symbol: "AAPL", yield: "0.52%", quarterly: "$0.25", next: "Mar 14" },
                      { name: "Microsoft", symbol: "MSFT", yield: "0.72%", quarterly: "$0.75", next: "Mar 20" },
                      { name: "Johnson & Johnson", symbol: "JNJ", yield: "2.9%", quarterly: "$1.19", next: "Mar 04" },
                    ].map(h => (
                      <div key={h.symbol} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/5 border border-white/5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                            <span className="text-xs font-bold text-emerald-400">{h.symbol[0]}</span>
                          </div>
                          <div>
                            <p className="text-sm text-slate-200 font-medium">{h.symbol}</p>
                            <p className="text-xs text-slate-500">{h.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-emerald-400">{h.yield}</p>
                          <p className="text-xs text-slate-500">{h.quarterly}/qtr · ex {h.next}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}