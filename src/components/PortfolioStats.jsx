import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, BarChart3 } from "lucide-react";

export default function PortfolioStats({ positions }) {
  const totalValue = positions?.reduce((acc, p) => acc + (p.quantity * (p.current_price || p.avg_cost)), 0) || 0;
  const totalCost = positions?.reduce((acc, p) => acc + (p.quantity * p.avg_cost), 0) || 0;
  const totalPL = totalValue - totalCost;
  const plPercent = totalCost > 0 ? ((totalPL / totalCost) * 100) : 0;
  const isPositive = totalPL >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="bg-slate-900 border-slate-800 p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-400">Portfolio Value</span>
          <Wallet className="w-5 h-5 text-blue-400" />
        </div>
        <p className="text-2xl font-bold text-white">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
      </Card>
      <Card className="bg-slate-900 border-slate-800 p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-400">Total P&L</span>
          {isPositive ? <TrendingUp className="w-5 h-5 text-emerald-400" /> : <TrendingDown className="w-5 h-5 text-red-400" />}
        </div>
        <p className={`text-2xl font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
          {isPositive ? '+' : ''}${totalPL.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
        <p className={`text-sm ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>{isPositive ? '+' : ''}{plPercent.toFixed(2)}%</p>
      </Card>
      <Card className="bg-slate-900 border-slate-800 p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-400">Positions</span>
          <BarChart3 className="w-5 h-5 text-violet-400" />
        </div>
        <p className="text-2xl font-bold text-white">{positions?.length || 0}</p>
      </Card>
    </div>
  );
}