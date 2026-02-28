import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import PortfolioStats from "@/components/dashboard/PortfolioStats";
import PositionsList from "@/components/PositionsList";
import TradeForm from "@/components/TradeForm";
import PaymentForm from "@/components/PaymentForm";
import PaymentsList from "@/components/PaymentsList";
import AddMoneyForm from "@/components/AddMoneyForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Send, Wallet, PieChart, ArrowRight, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import TokenGate from "@/components/TokenGate";
import WalletConnectModal from "@/components/WalletConnectModal";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [tokenHolder, setTokenHolder] = useState(null);
  const [showWalletModal, setShowWalletModal] = useState(false);

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

  const { data: etfPortfolios } = useQuery({
    queryKey: ['etf_portfolios'],
    queryFn: () => base44.entities.ETFPortfolio.list('-created_date', 3)
  });

  const balance = balanceList?.[0];

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero Banner */}
      <div className="relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=1600&q=80"
          alt="Finance Hero"
          className="w-full h-64 object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-slate-950/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
        <div className="absolute inset-0 flex items-center px-8 md:px-16">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-sm font-medium">Markets Open</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
              Welcome{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''} 👋
            </h1>
            <p className="text-slate-400 text-lg">Your financial command center</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-8">

        <PortfolioStats holdings={positions || []} transactions={[]} />

        {/* ETF Portfolio Promo Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-blue-500/20">
          <img
            src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&q=80"
            alt="ETF Portfolios"
            className="absolute inset-0 w-full h-full object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-950/90 via-slate-900/80 to-transparent" />
          <div className="relative flex items-center justify-between p-6 gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-blue-500/20 border border-blue-500/30 shrink-0">
                <PieChart className="w-7 h-7 text-blue-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white font-bold text-lg">Custom ETF Portfolios</h3>
                  {etfPortfolios?.length > 0 && (
                    <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {etfPortfolios.length}
                    </span>
                  )}
                </div>
                <p className="text-slate-400 text-sm">Build diversified portfolios with custom asset allocations</p>
              </div>
            </div>
            <Link to={createPageUrl("ETFPortfolios")}>
              <Button className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 shrink-0">
                <span className="hidden sm:inline">Manage Portfolios</span>
                <ArrowRight className="w-4 h-4 sm:ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="trade" className="w-full">
          <TabsList className="bg-slate-900 border border-slate-800 h-12 p-1">
            <TabsTrigger value="trade" className="data-[state=active]:bg-slate-700 text-slate-400 data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 mr-2" />Trade
            </TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:bg-slate-700 text-slate-400 data-[state=active]:text-white">
              <Send className="w-4 h-4 mr-2" />Payments
            </TabsTrigger>
            <TabsTrigger value="wallet" className="data-[state=active]:bg-slate-700 text-slate-400 data-[state=active]:text-white">
              <Wallet className="w-4 h-4 mr-2" />Wallet
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trade" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TradeForm positions={positions || []} />
              <PositionsList positions={positions || []} />
            </div>
          </TabsContent>

          <TabsContent value="payments" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PaymentForm user={user} />
              <PaymentsList payments={payments || []} user={user} />
            </div>
          </TabsContent>

          <TabsContent value="wallet" className="mt-6">
            <div className="max-w-md">
              <AddMoneyForm balance={balance} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}