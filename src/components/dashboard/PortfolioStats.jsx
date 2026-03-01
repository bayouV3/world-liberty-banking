import { TrendingUp, TrendingDown, Wallet, BarChart2, ShieldCheck, DollarSign, PieChart, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, ReferenceLine, BarChart, Bar, Cell,
  PieChart as RechartsPie, Pie, RadialBarChart, RadialBar
} from "recharts";

const TIMEFRAMES = ["1D", "1W", "1M", "1Y", "All"];

const STEEL_COLORS = ["#7eb3ff", "#5ecb94", "#d4a94a", "#e87070", "#adb5bd", "#a78bfa"];

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
    if (timeframe === "1D") date.setHours(date.getHours() - (points - i));
    else if (timeframe === "1W") date.setDate(date.getDate() - (points - i));
    else if (timeframe === "1M") date.setDate(date.getDate() - (points - i));
    else if (timeframe === "1Y") date.setDate(date.getDate() - (points - i) * 7);
    else date.setDate(date.getDate() - (points - i) * 14);

    const label = timeframe === "1D"
      ? `${date.getHours()}:00`
      : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    data.push({
      date: label,
      portfolio: Math.max(0, portfolioVal),
      sp500: spVal,
      nasdaq: nasdaqVal,
      volume: Math.floor(Math.random() * 8000 + 2000),
    });
  }

  const startPortfolio = data[0]?.portfolio || 1;
  return data.map(d => ({
    ...d,
    portfolioPct: ((d.portfolio - startPortfolio) / startPortfolio) * 100,
    sp500Pct: d.sp500 - 100,
    nasdaqPct: d.nasdaq - 100,
  }));
}

const DIVIDEND_DATA = [
  { month: "Jan", payout: 45 }, { month: "Feb", payout: 42 }, { month: "Mar", payout: 52 },
  { month: "Apr", payout: 48 }, { month: "May", payout: 56 }, { month: "Jun", payout: 45 },
  { month: "Jul", payout: 60 }, { month: "Aug", payout: 53 }, { month: "Sep", payout: 57 },
  { month: "Oct", payout: 63 }, { month: "Nov", payout: 68 }, { month: "Dec", payout: 75 },
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
  const annualReturn = avg * 252;
  const sharpe = volatility > 0 ? ((annualReturn - 0.05) / (volatility / 100)).toFixed(2) : "0.00";
  const beta = (0.8 + Math.random() * 0.5).toFixed(2);
  return { volatility: volatility.toFixed(1), sharpe, beta };
}

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#1e2022", border: "1px solid #3a3d42", borderRadius: 10, padding: "10px 14px" }}>
      <p className="text-slate-400 text-xs mb-1.5">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-400">{p.name}:</span>
          <span className="font-semibold" style={{ color: p.color }}>
            {p.value >= 0 ? "+" : ""}{typeof p.value === 'number' ? p.value.toFixed(2) : p.value}
            {p.name !== "Volume" ? "%" : ""}
          </span>
        </div>
      ))}
    </div>
  );
};

const TabBtn = ({ active, onClick, icon: Icon, label }) => (
  <button onClick={onClick}
    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
    style={active
      ? { background: "linear-gradient(145deg, #2e3236, #262a2e)", border: "1px solid #44474c", color: "#e8eaec" }
      : { background: "transparent", border: "1px solid transparent", color: "#64748b" }}>
    <Icon className="w-3 h-3" />{label}
  </button>
);

const TFBtn = ({ active, onClick, label }) => (
  <button onClick={onClick}
    className="px-2.5 py-1 rounded-md text-xs font-medium transition-all"
    style={active
      ? { background: "#2e3236", color: "#e8eaec", border: "1px solid #44474c" }
      : { color: "#64748b", border: "1px solid transparent" }}>
    {label}
  </button>
);

const MetricCard = ({ label, value, sub, color, Icon, delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
    <div className="p-4 rounded-2xl" style={{ background: "linear-gradient(145deg, #2a2d30, #202326)", border: "1px solid #3a3d42" }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-500">{label}</span>
        <div className="p-1.5 rounded-lg" style={{ background: "linear-gradient(145deg, #333740, #282b2f)", border: "1px solid #44474c" }}>
          <Icon className="w-3.5 h-3.5" style={{ color }} />
        </div>
      </div>
      <p className="text-xl font-bold tracking-tight" style={{ color }}>{value}</p>
      <p className="text-xs text-slate-600 mt-1">{sub}</p>
    </div>
  </motion.div>
);

export default function PortfolioStats({ holdings, transactions }) {
  const [timeframe, setTimeframe] = useState("1M");
  const [activeTab, setActiveTab] = useState("performance");

  const totalValue = holdings?.reduce((acc, h) => acc + (h.quantity * (h.current_price || h.average_cost || 0)), 0) || 12450;
  const totalCost = holdings?.reduce((acc, h) => acc + (h.quantity * (h.average_cost || 0)), 0) || 10000;
  const totalGain = totalValue - totalCost;
  const gainPercent = totalCost > 0 ? ((totalGain / totalCost) * 100) : 0;
  const isPositive = totalGain >= 0;

  const todayTransactions = transactions?.filter(t => new Date(t.created_date).toDateString() === new Date().toDateString()) || [];
  const todayVolume = todayTransactions.reduce((acc, t) => acc + (t.total_value || 0), 0);

  const chartData = useMemo(() => generateData(totalValue, timeframe), [totalValue, timeframe]);
  const riskMetrics = useMemo(() => calcRiskMetrics(chartData), [chartData]);

  const endPortfolio = chartData[chartData.length - 1]?.portfolioPct || 0;
  const endSP = chartData[chartData.length - 1]?.sp500Pct || 0;
  const endNasdaq = chartData[chartData.length - 1]?.nasdaqPct || 0;
  const vsSpDiff = (endPortfolio - endSP).toFixed(2);
  const vsNasdaqDiff = (endPortfolio - endNasdaq).toFixed(2);

  // Allocation donut data from holdings
  const allocationData = holdings?.length > 0
    ? holdings.slice(0, 5).map((h, i) => ({
        name: h.asset || h.symbol || `Asset ${i + 1}`,
        value: h.quantity * (h.current_price || h.average_cost || 1),
        color: STEEL_COLORS[i % STEEL_COLORS.length],
      }))
    : [
        { name: "AAPL", value: 4200, color: STEEL_COLORS[0] },
        { name: "BTC", value: 3100, color: STEEL_COLORS[1] },
        { name: "MSFT", value: 2800, color: STEEL_COLORS[2] },
        { name: "ETH", value: 1500, color: STEEL_COLORS[3] },
        { name: "Cash", value: 850, color: STEEL_COLORS[4] },
      ];

  const allocTotal = allocationData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="p-5 space-y-5">
      {/* ── Stat Cards ───────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Portfolio Value" delay={0}
          value={`$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          sub={`${isPositive ? '+' : ''}${gainPercent.toFixed(2)}% all time`}
          color={isPositive ? "#5ecb94" : "#e87070"} Icon={Wallet} />
        <MetricCard label="Total P&L" delay={0.06}
          value={`${isPositive ? '+' : ''}$${Math.abs(totalGain).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          sub={`vs $${totalCost.toLocaleString('en-US', { maximumFractionDigits: 0 })} invested`}
          color={isPositive ? "#5ecb94" : "#e87070"} Icon={isPositive ? TrendingUp : TrendingDown} />
        <MetricCard label="Today's Volume" delay={0.12}
          value={`$${todayVolume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          sub={`${todayTransactions.length} trades today`}
          color="#7eb3ff" Icon={BarChart2} />
        <MetricCard label="Sharpe Ratio" delay={0.18}
          value={riskMetrics.sharpe}
          sub={`Vol: ${riskMetrics.volatility}% · Beta: ${riskMetrics.beta}`}
          color={parseFloat(riskMetrics.sharpe) > 1 ? "#5ecb94" : "#d4a94a"} Icon={ShieldCheck} />
      </div>

      {/* ── Main analytics card ───────────────── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(145deg, #1e2022, #1a1c1e)", border: "1px solid #2e3236" }}>

        {/* Tab bar */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3" style={{ borderBottom: "1px solid #2e3236" }}>
          <div className="flex gap-1">
            {[
              { id: "performance", label: "Performance", icon: TrendingUp },
              { id: "allocation", label: "Allocation", icon: PieChart },
              { id: "risk", label: "Risk", icon: ShieldCheck },
              { id: "dividends", label: "Dividends", icon: DollarSign },
            ].map(t => <TabBtn key={t.id} active={activeTab === t.id} onClick={() => setActiveTab(t.id)} icon={t.icon} label={t.label} />)}
          </div>
          {(activeTab === "performance" || activeTab === "risk") && (
            <div className="flex gap-1">
              {TIMEFRAMES.map(tf => <TFBtn key={tf} active={timeframe === tf} onClick={() => setTimeframe(tf)} label={tf} />)}
            </div>
          )}
        </div>

        <div className="p-4">

          {/* ── PERFORMANCE ── */}
          {activeTab === "performance" && (
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  { label: "Portfolio", color: "#7eb3ff", value: endPortfolio },
                  { label: "S&P 500", color: "#5ecb94", value: endSP, diff: vsSpDiff },
                  { label: "Nasdaq", color: "#a78bfa", value: endNasdaq, diff: vsNasdaqDiff },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #2e3236" }}>
                    <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                    <span className="text-slate-400">{item.label}</span>
                    <span className="font-semibold" style={{ color: item.color }}>
                      {item.value >= 0 ? "+" : ""}{item.value.toFixed(2)}%
                    </span>
                    {item.diff !== undefined && (
                      <span className="text-xs" style={{ color: parseFloat(item.diff) >= 0 ? "#5ecb94" : "#e87070" }}>
                        ({parseFloat(item.diff) >= 0 ? "+" : ""}{item.diff}% vs idx)
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="pfGradPerf" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7eb3ff" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#7eb3ff" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10 }} interval="preserveStartEnd" />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10 }} tickFormatter={v => `${v.toFixed(1)}%`} width={48} />
                    <Tooltip content={<ChartTooltip />} />
                    <ReferenceLine y={0} stroke="#3a3d42" strokeDasharray="3 3" />
                    <Area type="monotone" dataKey="portfolioPct" name="Portfolio" stroke="#7eb3ff" strokeWidth={2} fill="url(#pfGradPerf)" dot={false} />
                    <Line type="monotone" dataKey="sp500Pct" name="S&P 500" stroke="#5ecb94" strokeWidth={1.5} strokeDasharray="5 3" dot={false} />
                    <Line type="monotone" dataKey="nasdaqPct" name="Nasdaq" stroke="#a78bfa" strokeWidth={1.5} strokeDasharray="5 3" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Volume mini-chart */}
              <div className="mt-3 pt-3" style={{ borderTop: "1px solid #2e3236" }}>
                <p className="text-[10px] text-slate-600 mb-1.5 uppercase tracking-widest">Volume</p>
                <div className="h-[60px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.slice(-20)} margin={{ top: 0, right: 5, left: 0, bottom: 0 }} barSize={4}>
                      <Bar dataKey="volume" name="Volume" fill="#3a3d42" radius={[2, 2, 0, 0]}>
                        {chartData.slice(-20).map((_, i) => (
                          <Cell key={i} fill={i === chartData.slice(-20).length - 1 ? "#7eb3ff" : "#2e3236"} />
                        ))}
                      </Bar>
                      <XAxis dataKey="date" hide />
                      <Tooltip content={<ChartTooltip />} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* ── ALLOCATION ── */}
          {activeTab === "allocation" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="h-[240px] flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie data={allocationData} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                      dataKey="value" paddingAngle={3} strokeWidth={0}>
                      {allocationData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [`$${v.toLocaleString()}`, ""]}
                      contentStyle={{ background: "#1e2022", border: "1px solid #3a3d42", borderRadius: 10, fontSize: 12 }}
                      labelStyle={{ color: "#94a3b8" }} />
                  </RechartsPie>
                </ResponsiveContainer>
                {/* Center label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs text-slate-500">Total</span>
                  <span className="text-lg font-bold text-slate-100">${(allocTotal / 1000).toFixed(1)}K</span>
                </div>
              </div>

              <div className="space-y-2.5">
                {allocationData.map((item) => {
                  const pct = ((item.value / allocTotal) * 100).toFixed(1);
                  return (
                    <div key={item.name}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-sm" style={{ background: item.color }} />
                          <span className="text-sm font-medium text-slate-300">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-500">${item.value.toLocaleString()}</span>
                          <span className="text-xs font-semibold w-10 text-right" style={{ color: item.color }}>{pct}%</span>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full" style={{ background: "#2e3236" }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: item.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── RISK ── */}
          {activeTab === "risk" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: "Volatility (Ann.)", value: `${riskMetrics.volatility}%`, desc: riskMetrics.volatility < 15 ? "Low risk" : riskMetrics.volatility < 25 ? "Moderate" : "High risk", color: riskMetrics.volatility < 15 ? "#5ecb94" : riskMetrics.volatility < 25 ? "#d4a94a" : "#e87070", pct: Math.min(100, (riskMetrics.volatility / 50) * 100) },
                  { label: "Sharpe Ratio", value: riskMetrics.sharpe, desc: riskMetrics.sharpe > 2 ? "Excellent" : riskMetrics.sharpe > 1 ? "Good" : "Below avg", color: riskMetrics.sharpe > 2 ? "#5ecb94" : riskMetrics.sharpe > 1 ? "#7eb3ff" : "#d4a94a", pct: Math.min(100, (riskMetrics.sharpe / 3) * 100) },
                  { label: "Beta vs S&P 500", value: riskMetrics.beta, desc: riskMetrics.beta < 1 ? "Less volatile" : "More volatile", color: riskMetrics.beta < 1 ? "#5ecb94" : "#d4a94a", pct: Math.min(100, (riskMetrics.beta / 2) * 100) },
                ].map(m => (
                  <div key={m.label} className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid #2e3236" }}>
                    <p className="text-xs text-slate-500 mb-1">{m.label}</p>
                    <p className="text-2xl font-bold" style={{ color: m.color }}>{m.value}</p>
                    <p className="text-xs mt-0.5" style={{ color: m.color + "99" }}>{m.desc}</p>
                    <div className="mt-3 h-1.5 rounded-full" style={{ background: "#2e3236" }}>
                      <div className="h-full rounded-full" style={{ width: `${m.pct}%`, background: m.color }} />
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <p className="text-xs text-slate-500 mb-3">Portfolio vs S&P 500 — Rolling Returns ({timeframe})</p>
                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="riskPfGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#7eb3ff" stopOpacity={0.2} />
                          <stop offset="100%" stopColor="#7eb3ff" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10 }} interval="preserveStartEnd" />
                      <YAxis hide />
                      <Tooltip content={<ChartTooltip />} />
                      <ReferenceLine y={0} stroke="#3a3d42" strokeDasharray="3 3" />
                      <Area type="monotone" dataKey="portfolioPct" name="Portfolio" stroke="#7eb3ff" strokeWidth={2} fill="url(#riskPfGrad)" dot={false} />
                      <Line type="monotone" dataKey="sp500Pct" name="S&P 500" stroke="#5ecb94" strokeWidth={1.5} strokeDasharray="5 3" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* ── DIVIDENDS ── */}
          {activeTab === "dividends" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Annual Yield", value: "1.47%", color: "#5ecb94" },
                  { label: "Annual Payout", value: "$612", color: "#7eb3ff" },
                  { label: "Next Ex-Date", value: "Mar 14", color: "#a78bfa" },
                  { label: "Paying Assets", value: `${Math.max(1, Math.floor((holdings?.length || 3) * 0.6))}`, color: "#d4a94a" },
                ].map(s => (
                  <div key={s.label} className="p-3 rounded-xl text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid #2e3236" }}>
                    <p className="text-xs text-slate-500 mb-1">{s.label}</p>
                    <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
                  </div>
                ))}
              </div>

              <div>
                <p className="text-xs text-slate-500 mb-2.5">Monthly Dividend Payout (USD)</p>
                <div className="h-[160px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={DIVIDEND_DATA} margin={{ top: 5, right: 5, left: 0, bottom: 0 }} barSize={14}>
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10 }} />
                      <YAxis hide />
                      <Tooltip
                        contentStyle={{ background: "#1e2022", border: "1px solid #3a3d42", borderRadius: 10, fontSize: 12 }}
                        formatter={(v) => [`$${v}`, "Payout"]} labelStyle={{ color: "#94a3b8" }} />
                      <Bar dataKey="payout" name="Payout" fill="#5ecb94" radius={[4, 4, 0, 0]}>
                        {DIVIDEND_DATA.map((_, i) => (
                          <Cell key={i} fill={i === DIVIDEND_DATA.length - 1 ? "#7eb3ff" : "#2a4a3a"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-500 mb-2">Dividend-Paying Holdings</p>
                <div className="space-y-2">
                  {[
                    { name: "Apple Inc.", symbol: "AAPL", yield: "0.52%", quarterly: "$0.25", next: "Mar 14" },
                    { name: "Microsoft", symbol: "MSFT", yield: "0.72%", quarterly: "$0.75", next: "Mar 20" },
                    { name: "Johnson & Johnson", symbol: "JNJ", yield: "2.9%", quarterly: "$1.19", next: "Mar 04" },
                  ].map(h => (
                    <div key={h.symbol} className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid #2e3236" }}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ background: "linear-gradient(145deg, #2a4a3a, #1e3a2a)", border: "1px solid #2e5a3a" }}>
                          <span className="text-xs font-bold" style={{ color: "#5ecb94" }}>{h.symbol[0]}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-200">{h.symbol}</p>
                          <p className="text-xs text-slate-500">{h.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold" style={{ color: "#5ecb94" }}>{h.yield}</p>
                        <p className="text-xs text-slate-500">{h.quarterly}/qtr · ex {h.next}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}