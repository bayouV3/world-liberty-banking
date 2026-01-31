import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function PortfolioChart({ holdings, transactions }) {
  const [timeframe, setTimeframe] = useState("1W");
  
  // Generate mock historical data based on current holdings
  const generateChartData = () => {
    const totalValue = holdings?.reduce((acc, h) => {
      const price = h.current_price || h.average_cost || 0;
      return acc + (h.quantity * price);
    }, 0) || 10000;

    const days = timeframe === "1D" ? 24 : timeframe === "1W" ? 7 : timeframe === "1M" ? 30 : 90;
    const data = [];
    
    for (let i = days; i >= 0; i--) {
      const variance = (Math.random() - 0.5) * 0.1;
      const dayValue = totalValue * (1 + variance * (i / days));
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      data.push({
        date: timeframe === "1D" 
          ? `${24 - i}:00` 
          : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: Math.max(0, dayValue)
      });
    }
    
    return data;
  };

  const chartData = generateChartData();
  const startValue = chartData[0]?.value || 0;
  const endValue = chartData[chartData.length - 1]?.value || 0;
  const isPositive = endValue >= startValue;

  const timeframes = ["1D", "1W", "1M", "3M"];

  return (
    <Card className="border-0 bg-slate-900/50 backdrop-blur-xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold text-slate-200">Portfolio Performance</CardTitle>
        <div className="flex gap-1">
          {timeframes.map((tf) => (
            <Button
              key={tf}
              variant="ghost"
              size="sm"
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 text-xs ${
                timeframe === tf 
                  ? "bg-slate-700 text-white" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tf}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="h-[200px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop 
                    offset="5%" 
                    stopColor={isPositive ? "#10B981" : "#EF4444"} 
                    stopOpacity={0.3}
                  />
                  <stop 
                    offset="95%" 
                    stopColor={isPositive ? "#10B981" : "#EF4444"} 
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748B', fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                hide
                domain={['dataMin - 1000', 'dataMax + 1000']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1E293B',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                labelStyle={{ color: '#94A3B8' }}
                itemStyle={{ color: isPositive ? '#10B981' : '#EF4444' }}
                formatter={(value) => [`$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 'Value']}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={isPositive ? "#10B981" : "#EF4444"}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </CardContent>
    </Card>
  );
}