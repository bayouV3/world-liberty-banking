import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { X, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function TradingHistoryModal({ onClose }) {
  const { data: trades, isLoading } = useQuery({
    queryKey: ["trades_history"],
    queryFn: () => base44.entities.Trade.list("-created_date", 50),
    initialData: [],
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ background: "#0d0d15", border: "1px solid #1e2030", maxHeight: "80vh" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid #1e2030" }}>
          <h3 className="text-white font-bold text-base">Trading History</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto" style={{ maxHeight: "calc(80vh - 65px)" }}>
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
            </div>
          ) : !trades?.length ? (
            <div className="text-center py-16 text-slate-600">No trades yet</div>
          ) : (
            <div className="p-4 space-y-2">
              {trades.map(trade => {
                const isBuy = trade.type === "buy";
                return (
                  <div key={trade.id} className="flex items-center justify-between p-3.5 rounded-xl"
                    style={{ background: "#111118", border: "1px solid #1e2030" }}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: isBuy ? "rgba(52,211,153,0.12)" : "rgba(251,113,133,0.12)" }}>
                        {isBuy ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-rose-400" />}
                      </div>
                      <div>
                        <p className="text-white text-sm font-semibold">
                          <span className="capitalize">{trade.type}</span> {trade.symbol}
                        </p>
                        <p className="text-slate-500 text-xs">{trade.quantity} shares @ ${trade.price?.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${isBuy ? "text-rose-400" : "text-emerald-400"}`}>
                        {isBuy ? "-" : "+"}${trade.total_value?.toFixed(2)}
                      </p>
                      <p className="text-xs text-slate-600">
                        {trade.created_date ? format(new Date(trade.created_date), "MMM d, h:mm a") : ""}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}