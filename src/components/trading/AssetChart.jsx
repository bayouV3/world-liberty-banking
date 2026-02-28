import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

function generateHistory(basePrice, points = 24) {
  const data = [];
  let price = basePrice * (0.92 + Math.random() * 0.08);
  for (let i = points; i >= 0; i--) {
    price = price * (1 + (Math.random() - 0.48) * 0.025);
    data.push({
      time: `${i}h`,
      price: parseFloat(price.toFixed(2)),
    });
  }
  // Ensure last point is close to current price
  data[data.length - 1].price = basePrice;
  return data;
}

export default function AssetChart({ symbol, currentPrice }) {
  const data = useMemo(() => generateHistory(currentPrice), [symbol]);
  const first = data[0]?.price;
  const last = data[data.length - 1]?.price;
  const isUp = last >= first;
  const color = isUp ? "#34d399" : "#fb7185";

  return (
    <div className="rounded-xl p-3" style={{ background: "#111118", border: "1px solid #1e2030" }}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-slate-500 font-medium">{symbol} · 24h</span>
        <span className="text-xs font-semibold" style={{ color }}>
          {isUp ? "+" : ""}{(((last - first) / first) * 100).toFixed(2)}%
        </span>
      </div>
      <ResponsiveContainer width="100%" height={80}>
        <LineChart data={data}>
          <Line type="monotone" dataKey="price" stroke={color} strokeWidth={1.5} dot={false} />
          <XAxis dataKey="time" hide />
          <YAxis domain={["auto", "auto"]} hide />
          <Tooltip
            contentStyle={{ background: "#0d0d15", border: "1px solid #1e2030", borderRadius: 8, fontSize: 11 }}
            labelStyle={{ color: "#64748b" }}
            itemStyle={{ color: "#fff" }}
            formatter={(v) => [`$${v.toFixed(2)}`, ""]}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}