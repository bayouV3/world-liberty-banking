import { useState } from "react";
import { TrendingUp, TrendingDown, BarChart3, History } from "lucide-react";
import TradingHistoryModal from "@/components/trading/TradingHistoryModal";

export default function PositionsList({ positions }) {
  const [showHistory, setShowHistory] = useState(false);

  if (!positions?.length) {
    return (
      <div className="rounded-2xl p-6 text-center" style={{ background: "#0d0d15", border: "1px solid #1e2030" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold">Positions</h3>
          <button onClick={() => setShowHistory(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-all"
            style={{ border: "1px solid #1e2030" }}>
            <History className="w-3.5 h-3.5" /> History
          </button>
        </div>
        <BarChart3 className="w-10 h-10 mx-auto mb-2" style={{ color: "#1e2030" }} />
        <p className="text-slate-600 text-sm">No positions yet</p>
        {showHistory && <TradingHistoryModal onClose={() => setShowHistory(false)} />}
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#0d0d15", border: "1px solid #1e2030" }}>
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <h3 className="text-white font-bold">Positions</h3>
        <button onClick={() => setShowHistory(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-all"
          style={{ border: "1px solid #1e2030" }}>
          <History className="w-3.5 h-3.5" /> History
        </button>
      </div>
      <div className="p-4 pt-2 space-y-2">
        {positions.map((pos) => {
          const currentPrice = pos.current_price || pos.avg_cost;
          const marketValue = pos.quantity * currentPrice;
          const pl = marketValue - (pos.quantity * pos.avg_cost);
          const plPercent = pos.avg_cost > 0 ? ((pl / (pos.quantity * pos.avg_cost)) * 100) : 0;
          const isPositive = pl >= 0;

          return (
            <div key={pos.id} className="p-3.5 rounded-xl flex justify-between items-center" style={{ background: "#111118", border: "1px solid #1e2030" }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-xs"
                  style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                  {pos.symbol?.slice(0, 2)}
                </div>
                <div>
                  <span className="font-semibold text-white text-sm">{pos.symbol}</span>
                  <p className="text-xs text-slate-500">{pos.quantity} @ ${pos.avg_cost?.toFixed(2)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-white text-sm">${marketValue.toFixed(2)}</p>
                <div className={`flex items-center justify-end gap-0.5 text-xs ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span>{isPositive ? '+' : ''}{plPercent.toFixed(2)}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showHistory && <TradingHistoryModal onClose={() => setShowHistory(false)} />}
    </div>
  );
}