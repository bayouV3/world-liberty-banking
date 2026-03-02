import { useState, useMemo, useEffect } from "react";
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, BarChart, Bar, Cell } from "recharts";
import { TrendingUp, TrendingDown, ChevronUp, ChevronDown } from "lucide-react";

const ASSETS = [
  { symbol: "AAPL", name: "Apple Inc.", sector: "Tech", price: 178.42, change: 0.83, mktCap: "2.78T", pe: 28.4, vol: "58.2M" },
  { symbol: "MSFT", name: "Microsoft", sector: "Tech", price: 415.20, change: 0.62, mktCap: "3.08T", pe: 35.1, vol: "22.1M" },
  { symbol: "NVDA", name: "NVIDIA Corp", sector: "Semi", price: 875.64, change: 3.21, mktCap: "2.16T", pe: 62.3, vol: "41.5M" },
  { symbol: "GOOGL", name: "Alphabet", sector: "Tech", price: 164.32, change: -0.34, mktCap: "2.04T", pe: 24.8, vol: "19.3M" },
  { symbol: "TSLA", name: "Tesla", sector: "Auto", price: 242.11, change: -1.87, mktCap: "772B", pe: 52.1, vol: "88.4M" },
  { symbol: "AMZN", name: "Amazon", sector: "Retail", price: 192.45, change: 0.95, mktCap: "2.01T", pe: 45.2, vol: "31.7M" },
  { symbol: "META", name: "Meta Platforms", sector: "Social", price: 527.80, change: 1.42, mktCap: "1.34T", pe: 27.9, vol: "17.8M" },
  { symbol: "BTC", name: "Bitcoin", sector: "Crypto", price: 67234.50, change: 2.87, mktCap: "1.32T", pe: "N/A", vol: "$42.1B" },
  { symbol: "ETH", name: "Ethereum", sector: "Crypto", price: 3512.80, change: 1.54, mktCap: "421B", pe: "N/A", vol: "$18.4B" },
  { symbol: "SPX", name: "S&P 500 Index", sector: "Index", price: 5234.18, change: 0.42, mktCap: "—", pe: 21.4, vol: "—" },
  { symbol: "GLD", name: "Gold", sector: "Commod.", price: 2312.40, change: 0.28, mktCap: "—", pe: "—", vol: "—" },
  { symbol: "OIL", name: "Crude Oil WTI", sector: "Commod.", price: 78.32, change: -0.67, mktCap: "—", pe: "—", vol: "—" },
];

function generateChart(price, change, points = 80) {
  const data = [];
  let v = price * (1 - Math.abs(change) * 0.008);
  for (let i = 0; i < points; i++) {
    v += (Math.random() - (change > 0 ? 0.45 : 0.55)) * price * 0.003;
    v = Math.max(v, price * 0.85);
    data.push({ v: parseFloat(v.toFixed(2)), i });
  }
  data.push({ v: price, i: points });
  return data;
}

const ChartTip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0f1a0f", border: "1px solid #2a4a2a", borderRadius: 6, padding: "4px 10px", fontSize: 11 }}>
      <span style={{ color: "#c8d0d8" }}>{payload[0].value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
    </div>
  );
};

export default function MarketPanel() {
  const [selected, setSelected] = useState(ASSETS[0]);
  const [assets, setAssets] = useState(ASSETS);
  const [sortKey, setSortKey] = useState("symbol");
  const [sortDir, setSortDir] = useState(1);

  const chartData = useMemo(() => generateChart(selected.price, selected.change), [selected.symbol]);
  const up = selected.change >= 0;

  useEffect(() => {
    const id = setInterval(() => {
      setAssets(prev => prev.map(a => {
        if (a.symbol === selected.symbol) return a;
        const delta = (Math.random() - 0.5) * 0.003 * a.price;
        return { ...a, price: parseFloat((a.price + delta).toFixed(2)), change: parseFloat((a.change + (Math.random() - 0.5) * 0.05).toFixed(2)) };
      }));
    }, 2000);
    return () => clearInterval(id);
  }, [selected.symbol]);

  const sorted = [...assets].sort((a, b) => {
    const av = typeof a[sortKey] === 'number' ? a[sortKey] : 0;
    const bv = typeof b[sortKey] === 'number' ? b[sortKey] : 0;
    return sortDir * (av - bv || a.symbol.localeCompare(b.symbol));
  });

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d * -1);
    else { setSortKey(key); setSortDir(-1); }
  };

  return (
    <div className="flex flex-col h-full" style={{ background: "#0d1117" }}>
      {/* Chart area */}
      <div className="p-3 border-b" style={{ borderColor: "#1a2a1a" }}>
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold font-mono" style={{ color: "#ff6600" }}>{selected.symbol}</span>
              <span className="text-xs" style={{ color: "#6a7a6a" }}>{selected.name}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "#1a2a1a", color: "#6a9a6a" }}>{selected.sector}</span>
            </div>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-2xl font-bold font-mono" style={{ color: "#e8f0e8" }}>
                {selected.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-sm font-mono font-semibold" style={{ color: up ? "#00d084" : "#ff4444" }}>
                {up ? "+" : ""}{selected.change.toFixed(2)}%
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-x-4 gap-y-0.5 text-right">
            {[["MktCap", selected.mktCap], ["P/E", selected.pe], ["Volume", selected.vol]].map(([k, v]) => (
              <div key={k}>
                <div className="text-[9px] uppercase tracking-widest" style={{ color: "#4a5a4a" }}>{k}</div>
                <div className="text-xs font-mono" style={{ color: "#8a9a8a" }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="h-[130px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={up ? "#00d084" : "#ff4444"} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={up ? "#00d084" : "#ff4444"} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis hide />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip content={<ChartTip />} />
              <Area type="monotone" dataKey="v" stroke={up ? "#00d084" : "#ff4444"} strokeWidth={1.5} fill="url(#areaGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Watchlist table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs font-mono">
          <thead className="sticky top-0" style={{ background: "#0a0c0d" }}>
            <tr>
              {[["symbol", "SYMBOL"], ["price", "LAST"], ["change", "CHG%"], ["sector", "SECTOR"]].map(([key, label]) => (
                <th key={key} className="px-3 py-1.5 text-left cursor-pointer hover:opacity-80 select-none font-semibold"
                  style={{ color: "#4a6a4a", borderBottom: "1px solid #1a2a1a", borderRight: "1px solid #0f1a0f" }}
                  onClick={() => handleSort(key)}>
                  <span className="flex items-center gap-1">
                    {label}
                    {sortKey === key && (sortDir === 1 ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((a) => {
              const isUp = a.change >= 0;
              const isSel = a.symbol === selected.symbol;
              return (
                <tr key={a.symbol} onClick={() => setSelected(a)} className="cursor-pointer transition-colors"
                  style={{ background: isSel ? "#0f2a1a" : "transparent", borderBottom: "1px solid #0d1a0d" }}
                  onMouseEnter={e => !isSel && (e.currentTarget.style.background = "#0a1a0a")}
                  onMouseLeave={e => !isSel && (e.currentTarget.style.background = "transparent")}>
                  <td className="px-3 py-1.5 font-bold" style={{ color: "#ff6600", borderRight: "1px solid #0f1a0f" }}>{a.symbol}</td>
                  <td className="px-3 py-1.5 text-right" style={{ color: "#c8d0c8", borderRight: "1px solid #0f1a0f" }}>
                    {a.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-3 py-1.5 text-right font-semibold" style={{ color: isUp ? "#00d084" : "#ff4444", borderRight: "1px solid #0f1a0f" }}>
                    {isUp ? "+" : ""}{a.change.toFixed(2)}%
                  </td>
                  <td className="px-3 py-1.5" style={{ color: "#4a7a4a" }}>{a.sector}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}