import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";

export default function PositionsList({ positions }) {
  if (!positions?.length) {
    return (
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader><CardTitle className="text-white">Positions</CardTitle></CardHeader>
        <CardContent className="text-center py-12">
          <BarChart3 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No positions yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader><CardTitle className="text-white">Positions</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {positions.map((pos) => {
          const currentPrice = pos.current_price || pos.avg_cost;
          const marketValue = pos.quantity * currentPrice;
          const pl = marketValue - (pos.quantity * pos.avg_cost);
          const plPercent = pos.avg_cost > 0 ? ((pl / (pos.quantity * pos.avg_cost)) * 100) : 0;
          const isPositive = pl >= 0;

          return (
            <div key={pos.id} className="p-4 rounded-xl bg-slate-800/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white">
                  {pos.symbol?.slice(0, 2)}
                </div>
                <div>
                  <span className="font-semibold text-white">{pos.symbol}</span>
                  <p className="text-sm text-slate-400">{pos.quantity} @ ${pos.avg_cost?.toFixed(2)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-white">${marketValue.toFixed(2)}</p>
                <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span>{isPositive ? '+' : ''}{plPercent.toFixed(2)}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}