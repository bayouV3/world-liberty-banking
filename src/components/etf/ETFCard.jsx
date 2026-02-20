import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, TrendingUp, Circle } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899", "#84cc16", "#f97316"];

const statusColors = {
  active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  paused: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  archived: "bg-slate-700/50 text-slate-400 border-slate-600"
};

export default function ETFCard({ portfolio, onDelete }) {
  const allocations = portfolio.allocations || [];
  const chartData = allocations.map((a, i) => ({ name: a.symbol, value: parseFloat(a.weight) || 0, color: COLORS[i % COLORS.length] }));

  return (
    <Card className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-all group overflow-hidden">
      {/* Top accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-violet-500 to-emerald-500" />

      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-white font-bold text-lg truncate">{portfolio.name}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusColors[portfolio.status] || statusColors.active}`}>
                {portfolio.status || "active"}
              </span>
            </div>
            {portfolio.description && (
              <p className="text-slate-400 text-sm line-clamp-2">{portfolio.description}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Chart + Allocations */}
        <div className="flex gap-4 items-center">
          {chartData.length > 0 && (
            <div className="w-24 h-24 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={20} outerRadius={42} dataKey="value" strokeWidth={0}>
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px", fontSize: "12px" }}
                    formatter={(v) => [`${v}%`, ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="flex-1 space-y-1.5 min-w-0">
            {allocations.slice(0, 5).map((a, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-slate-300 text-xs font-mono font-semibold w-12 shrink-0">{a.symbol}</span>
                <div className="flex-1 h-1 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${a.weight}%`, backgroundColor: COLORS[i % COLORS.length] }}
                  />
                </div>
                <span className="text-slate-400 text-xs w-10 text-right shrink-0">{a.weight}%</span>
              </div>
            ))}
            {allocations.length > 5 && (
              <p className="text-slate-500 text-xs">+{allocations.length - 5} more assets</p>
            )}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
          <span className="text-slate-500 text-xs">{allocations.length} assets</span>
          <span className="text-slate-500 text-xs">{new Date(portfolio.created_date).toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  );
}