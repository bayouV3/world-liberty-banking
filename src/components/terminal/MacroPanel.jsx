import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

const MACRO_DATA = [
  { key: "Fed Funds Rate", value: "5.33%", prev: "5.33%", delta: 0, category: "Rates" },
  { key: "10Y Treasury", value: "4.38%", prev: "4.25%", delta: 0.13, category: "Rates" },
  { key: "2Y Treasury", value: "4.62%", prev: "4.71%", delta: -0.09, category: "Rates" },
  { key: "Yield Curve (2s10s)", value: "-0.24%", prev: "-0.46%", delta: 0.22, category: "Rates" },
  { key: "CPI YoY", value: "2.8%", prev: "3.1%", delta: -0.3, category: "Inflation" },
  { key: "Core CPI", value: "3.2%", prev: "3.4%", delta: -0.2, category: "Inflation" },
  { key: "PPI YoY", value: "1.6%", prev: "1.8%", delta: -0.2, category: "Inflation" },
  { key: "PCE Deflator", value: "2.4%", prev: "2.6%", delta: -0.2, category: "Inflation" },
  { key: "Unemployment", value: "3.7%", prev: "3.8%", delta: -0.1, category: "Labor" },
  { key: "Non-Farm Payrolls", value: "+256K", prev: "+229K", delta: 27, category: "Labor" },
  { key: "GDP Growth (Q4)", value: "3.2%", prev: "2.9%", delta: 0.3, category: "Growth" },
  { key: "ISM Manufacturing", value: "49.1", prev: "47.8", delta: 1.3, category: "Growth" },
  { key: "Consumer Confidence", value: "104.7", prev: "110.3", delta: -5.6, category: "Sentiment" },
  { key: "VIX", value: "14.82", prev: "18.24", delta: -3.42, category: "Sentiment" },
  { key: "DXY (Dollar Index)", value: "103.24", prev: "104.10", delta: -0.86, category: "FX" },
  { key: "Gold Spot", value: "$2,312", prev: "$2,285", delta: 27, category: "Commod." },
];

const YIELD_CURVE = [
  { tenor: "1M", yield: 5.28 }, { tenor: "3M", yield: 5.32 }, { tenor: "6M", yield: 5.18 },
  { tenor: "1Y", yield: 4.95 }, { tenor: "2Y", yield: 4.62 }, { tenor: "3Y", yield: 4.48 },
  { tenor: "5Y", yield: 4.32 }, { tenor: "7Y", yield: 4.38 }, { tenor: "10Y", yield: 4.38 },
  { tenor: "20Y", yield: 4.64 }, { tenor: "30Y", yield: 4.54 },
];

const CATEGORIES = ["All", "Rates", "Inflation", "Labor", "Growth", "Sentiment", "FX", "Commod."];

const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0f1a0f", border: "1px solid #1a2a1a", borderRadius: 6, padding: "4px 10px", fontSize: 11 }}>
      <span style={{ color: "#6a9a6a" }}>{label}: </span>
      <span style={{ color: "#c8d0c8", fontWeight: "bold" }}>{payload[0].value.toFixed(2)}%</span>
    </div>
  );
};

export default function MacroPanel() {
  const [filter, setFilter] = useState("All");
  const filtered = MACRO_DATA.filter(d => filter === "All" || d.category === filter);

  return (
    <div className="flex flex-col h-full" style={{ background: "#0d1117" }}>
      <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: "#1a2a1a", background: "#0a0c0d" }}>
        <span className="text-xs font-bold font-mono uppercase tracking-widest" style={{ color: "#ff6600" }}>Macro Dashboard</span>
      </div>

      {/* Yield curve */}
      <div className="px-3 pt-3 pb-2 border-b" style={{ borderColor: "#1a2a1a" }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "#4a6a4a" }}>US Treasury Yield Curve</span>
          <span className="text-[9px] font-mono" style={{ color: "#3a5a3a" }}>INVERTED</span>
        </div>
        <div className="h-[90px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={YIELD_CURVE} margin={{ top: 2, right: 0, left: 0, bottom: 0 }} barSize={18}>
              <XAxis dataKey="tenor" axisLine={false} tickLine={false} tick={{ fill: '#3a5a3a', fontSize: 9 }} />
              <YAxis hide domain={[3.5, 5.5]} />
              <Tooltip content={<ChartTip />} />
              <ReferenceLine y={5.33} stroke="#ff6600" strokeDasharray="3 3" strokeWidth={1} />
              <Bar dataKey="yield" radius={[2, 2, 0, 0]}>
                {YIELD_CURVE.map((entry, i) => (
                  <Cell key={i} fill={entry.yield >= 5.0 ? "#00d084" : entry.yield < 4.5 ? "#ff4444" : "#3a7aff"} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex gap-1 px-3 py-2 overflow-x-auto border-b" style={{ borderColor: "#0f1a0f" }}>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setFilter(c)}
            className="shrink-0 text-[9px] font-mono uppercase px-2 py-0.5 rounded-sm transition-all"
            style={{
              background: filter === c ? "#1a3a1a" : "transparent",
              color: filter === c ? "#00d084" : "#4a6a4a",
              border: `1px solid ${filter === c ? "#2a5a2a" : "transparent"}`
            }}>
            {c}
          </button>
        ))}
      </div>

      {/* Data table */}
      <div className="flex-1 overflow-y-auto">
        {filtered.map((row, i) => {
          const up = row.delta > 0;
          const neutral = row.delta === 0;
          return (
            <div key={row.key} className="flex items-center justify-between px-3 py-1.5 font-mono text-xs border-b"
              style={{ borderColor: "#0a0f0a" }}>
              <div>
                <span style={{ color: "#7a9a7a" }}>{row.key}</span>
                <span className="ml-2 text-[9px] px-1 rounded" style={{ background: "#1a2a1a", color: "#3a5a3a" }}>{row.category}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold" style={{ color: "#e8f0e8" }}>{row.value}</span>
                <span className="text-[10px] w-16 text-right" style={{ color: neutral ? "#4a6a4a" : up ? "#00d084" : "#ff4444" }}>
                  {neutral ? "—" : `${up ? "+" : ""}${row.delta > 100 ? Math.round(row.delta) : row.delta.toFixed(2)}`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}