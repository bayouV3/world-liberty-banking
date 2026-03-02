import { useState } from "react";
import { Trash2, Bell, BellOff, TrendingUp, TrendingDown } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";

const TYPE_COLORS = { stock: "#7eb3ff", crypto: "#d4a94a", forex: "#5ecb94" };
const TYPE_BG = { stock: "rgba(126,179,255,0.08)", crypto: "rgba(212,169,74,0.08)", forex: "rgba(94,203,148,0.08)" };

// Generate small sparkline from price
function useSparkline(price) {
  const [history, setHistory] = useState(() => {
    const arr = [];
    let v = price * 0.98;
    for (let i = 0; i < 20; i++) {
      v += (Math.random() - 0.5) * price * 0.002;
      arr.push({ v: parseFloat(v.toFixed(4)) });
    }
    arr.push({ v: price });
    return arr;
  });
  return history;
}

export default function WatchlistRow({ item, price, change, onDelete, index }) {
  const sparkData = useSparkline(price || 0);
  const up = (change || 0) >= 0;
  const typeColor = TYPE_COLORS[item.asset_type] || "#adb5bd";
  const typeBg = TYPE_BG[item.asset_type] || "rgba(173,181,189,0.08)";
  const decimals = item.asset_type === "forex" ? 4 : item.symbol.includes("BTC") ? 2 : 2;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-default group"
      style={{ background: "linear-gradient(145deg, #232628, #1e2022)", border: "1px solid #2e3236" }}
    >
      {/* Icon */}
      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0"
        style={{ background: typeBg, color: typeColor, border: `1px solid ${typeColor}25` }}>
        {item.symbol.slice(0, 2)}
      </div>

      {/* Name & type */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold text-slate-100">{item.symbol}</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded font-medium capitalize hidden sm:inline"
            style={{ background: typeBg, color: typeColor }}>{item.asset_type}</span>
        </div>
        <p className="text-xs text-slate-500 truncate">{item.name}</p>
      </div>

      {/* Sparkline */}
      <div className="w-16 h-8 hidden sm:block">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sparkData}>
            <Line type="monotone" dataKey="v" stroke={up ? "#5ecb94" : "#e87070"} strokeWidth={1.5} dot={false} />
            <Tooltip contentStyle={{ display: "none" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Price & change */}
      <div className="text-right shrink-0">
        <p className="text-sm font-bold font-mono text-slate-100">
          {price ? price.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) : "—"}
        </p>
        <div className="flex items-center justify-end gap-0.5">
          {up ? <TrendingUp className="w-2.5 h-2.5" style={{ color: "#5ecb94" }} /> : <TrendingDown className="w-2.5 h-2.5" style={{ color: "#e87070" }} />}
          <span className="text-xs font-semibold font-mono" style={{ color: up ? "#5ecb94" : "#e87070" }}>
            {up ? "+" : ""}{(change || 0).toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Delete */}
      <button onClick={() => onDelete(item.id)}
        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-600 hover:text-red-400 transition-all"
        style={{ background: "rgba(255,255,255,0.04)" }}>
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}