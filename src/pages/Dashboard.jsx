import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import TradeForm from "@/components/TradeForm";
import PaymentForm from "@/components/PaymentForm";
import PaymentsList from "@/components/PaymentsList";
import AddMoneyForm from "@/components/AddMoneyForm";
import HeroBanner from "@/components/dashboard/HeroBanner.js";
import StatsBar from "@/components/dashboard/StatsBar.js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Send, Wallet, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: positions } = useQuery({
    queryKey: ['positions'],
    queryFn: () => base44.entities.Position.list()
  });

  const { data: payments } = useQuery({
    queryKey: ['payments'],
    queryFn: () => base44.entities.Payment.list('-created_date')
  });

  const { data: balanceList } = useQuery({
    queryKey: ['balance'],
    queryFn: () => base44.entities.Balance.list()
  });

  const balance = balanceList?.[0];

  return (
    <div className="min-h-screen bg-[#060810]">
      {/* Hero Banner */}
      <HeroBanner user={user} balance={balance} positions={positions || []} />

      {/* Stats Bar */}
      <StatsBar positions={positions || []} balance={balance} />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
        <Tabs defaultValue="trade" className="w-full">
          <TabsList className="bg-white/5 border border-white/10 backdrop-blur p-1 h-12 rounded-xl mb-8">
            <TabsTrigger
              value="trade"
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-400"
            >
              <BarChart3 className="w-4 h-4" />Trade
            </TabsTrigger>
            <TabsTrigger
              value="payments"
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-violet-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-400"
            >
              <Send className="w-4 h-4" />Payments
            </TabsTrigger>
            <TabsTrigger
              value="wallet"
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-400"
            >
              <Wallet className="w-4 h-4" />Wallet
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trade" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <TradeForm positions={positions || []} />
              <PositionsPanel positions={positions || []} />
            </motion.div>
          </TabsContent>

          <TabsContent value="payments" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <PaymentForm user={user} />
              <PaymentsList payments={payments || []} user={user} />
            </motion.div>
          </TabsContent>

          <TabsContent value="wallet" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-md"
            >
              <AddMoneyForm balance={balance} />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function PositionsPanel({ positions }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur overflow-hidden">
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
        <h2 className="font-semibold text-white text-lg">Positions</h2>
        <span className="text-xs text-slate-400 bg-white/5 px-2 py-1 rounded-full">{positions.length} assets</span>
      </div>
      <div className="divide-y divide-white/5">
        {positions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <BarChart3 className="w-10 h-10 mb-3 opacity-30" />
            <p>No positions yet</p>
          </div>
        ) : (
          positions.map((p, i) => {
            const value = (p.quantity || 0) * (p.current_price || 0);
            const cost = (p.quantity || 0) * (p.avg_cost || 0);
            const pnl = value - cost;
            const pct = cost > 0 ? (pnl / cost) * 100 : 0;
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500/30 to-violet-600/30 border border-white/10 flex items-center justify-center text-xs font-bold text-blue-300">
                    {p.symbol?.slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-medium text-white text-sm">{p.symbol}</p>
                    <p className="text-xs text-slate-500">{p.quantity} shares</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                  <p className={`text-xs font-medium ${pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {pnl >= 0 ? '+' : ''}{pct.toFixed(2)}%
                  </p>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}