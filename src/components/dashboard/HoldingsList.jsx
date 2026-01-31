import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Bitcoin, DollarSign, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

const assetIcons = {
  crypto: Bitcoin,
  stock: BarChart3,
  cash: DollarSign
};

const assetColors = {
  BTC: "from-orange-500 to-amber-600",
  ETH: "from-indigo-500 to-purple-600",
  USD: "from-emerald-500 to-green-600",
  AAPL: "from-slate-400 to-slate-600",
  GOOGL: "from-blue-500 to-cyan-600",
  TSLA: "from-red-500 to-rose-600",
  default: "from-blue-500 to-indigo-600"
};

export default function HoldingsList({ holdings }) {
  if (!holdings || holdings.length === 0) {
    return (
      <Card className="border-0 bg-slate-900/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-200">Your Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-slate-500" />
            </div>
            <p className="text-slate-400">No holdings yet</p>
            <p className="text-sm text-slate-500 mt-1">Start trading to build your portfolio</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-slate-900/50 backdrop-blur-xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-slate-200">Your Holdings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {holdings.map((holding, index) => {
          const currentPrice = holding.current_price || holding.average_cost || 0;
          const currentValue = holding.quantity * currentPrice;
          const costBasis = holding.quantity * (holding.average_cost || 0);
          const gain = currentValue - costBasis;
          const gainPercent = costBasis > 0 ? ((gain / costBasis) * 100) : 0;
          const isPositive = gain >= 0;
          const Icon = assetIcons[holding.asset_type] || BarChart3;
          const gradient = assetColors[holding.asset] || assetColors.default;

          return (
            <motion.div
              key={holding.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group"
            >
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-100">{holding.asset}</span>
                      <Badge variant="secondary" className="bg-slate-700 text-slate-300 text-xs">
                        {holding.asset_type}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-400">
                      {holding.quantity.toLocaleString()} {holding.asset}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-100">
                    ${currentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <div className={`flex items-center justify-end gap-1 text-sm ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span>{isPositive ? '+' : ''}{gainPercent.toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}