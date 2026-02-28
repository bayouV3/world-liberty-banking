import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import PortfolioStats from "@/components/dashboard/PortfolioStats";
import PositionsList from "@/components/PositionsList";
import TradeForm from "@/components/TradeForm";
import PaymentForm from "@/components/PaymentForm";
import PaymentsList from "@/components/PaymentsList";
import AddMoneyForm from "@/components/AddMoneyForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Send, Wallet, PieChart, ArrowRight, TrendingUp, TrendingDown, Zap, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import TokenGate from "@/components/TokenGate";
import CoinBalanceWidgets from "@/components/dashboard/CoinBalanceWidgets";
import WalletConnectModal from "@/components/WalletConnectModal";

const QUICK_ACTIONS = [
  { icon: Plus, label: "Add Money", tab: "wallet", color: "#6366f1" },
  { icon: Send, label: "Send", tab: "payments", color: "#34d399" },
  { icon: BarChart3, label: "Trade", tab: "trade", color: "#f59e0b" },
  { icon: PieChart, label: "ETFs", href: "ETFPortfolios", color: "#8b5cf6" },
];

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [tokenHolder, setTokenHolder] = useState(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [activeTab, setActiveTab] = useState("trade");

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
  const totalBalance = balance?.amount ?? 0;
  const portfolioValue = positions?.reduce((s, p) => s + ((p.current_price || p.avg_cost) * p.quantity), 0) ?? 0;
  const netWorth = totalBalance + portfolioValue;
  const change = 1247.32; // simulated daily change
  const changePct = 2.14;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">

      {/* ── Balance Hero ─────────────────────────────────────── */}
      <div className="relative px-5 pt-8 pb-6 overflow-hidden"
        style={{ background: "linear-gradient(160deg, #232628 0%, #1a1c1e 100%)", borderBottom: "1px solid #3a3d42" }}>
        {/* Steel sheen */}
        <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" }} />

        <div className="max-w-6xl mx-auto relative">

          {/* Crypto coin icons grid - upper right */}
          <div className="absolute top-0 right-0 hidden sm:grid grid-cols-6 gap-2 pointer-events-none select-none">
            {[
              { symbol: "BTC", color: "#f7931a", bg: "rgba(247,147,26,0.15)", label: "₿" },
              { symbol: "ETH", color: "#627eea", bg: "rgba(98,126,234,0.15)", label: "Ξ" },
              { symbol: "SOL", color: "#9945ff", bg: "rgba(153,69,255,0.15)", label: "◎" },
              { symbol: "BNB", color: "#f3ba2f", bg: "rgba(243,186,47,0.15)", label: "⬡" },
              { symbol: "ADA", color: "#0033ad", bg: "rgba(0,100,255,0.15)", label: "₳" },
              { symbol: "XRP", color: "#00aae4", bg: "rgba(0,170,228,0.15)", label: "✕" },
              { symbol: "DOGE", color: "#c2a633", bg: "rgba(194,166,51,0.15)", label: "Ð" },
              { symbol: "DOT", color: "#e6007a", bg: "rgba(230,0,122,0.15)", label: "●" },
              { symbol: "AVAX", color: "#e84142", bg: "rgba(232,65,66,0.15)", label: "▲" },
              { symbol: "LINK", color: "#2a5ada", bg: "rgba(42,90,218,0.15)", label: "⬡" },
              { symbol: "LTC", color: "#bfbbbb", bg: "rgba(191,187,187,0.15)", label: "Ł" },
              { symbol: "UNI", color: "#ff007a", bg: "rgba(255,0,122,0.15)", label: "🦄" },
            ].map(({ symbol, color, bg, label }) => (
              <div key={symbol}
                className="w-10 h-10 rounded-xl flex flex-col items-center justify-center"
                style={{ background: bg, border: `1px solid ${color}28` }}>
                <span className="text-base leading-none" style={{ color }}>{label}</span>
                <span className="text-[8px] font-bold mt-0.5" style={{ color: color + "99" }}>{symbol}</span>
              </div>
            ))}
          </div>

          <p className="text-slate-500 text-sm font-medium mb-1">
            Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''} 👋
          </p>
          <div className="flex items-end gap-4 mb-2">
            <h1 className="text-5xl font-black text-white tracking-tight">
              ${netWorth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ background: "rgba(52,211,153,0.12)", color: "#34d399" }}>
              <TrendingUp className="w-3 h-3" />
              +${change.toLocaleString()} (+{changePct}%)
            </div>
            <span className="text-slate-600 text-xs">Today</span>
          </div>

          {/* Balance breakdown pills */}
          <div className="flex gap-3 mt-5 flex-wrap">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.07] bg-white/[0.03] text-sm">
              <div className="w-2 h-2 rounded-full bg-indigo-400" />
              <span className="text-slate-400">Cash</span>
              <span className="text-white font-semibold">${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.07] bg-white/[0.03] text-sm">
              <div className="w-2 h-2 rounded-full bg-violet-400" />
              <span className="text-slate-400">Investments</span>
              <span className="text-white font-semibold">${portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-5 space-y-6 pb-10">

        {/* ── Coin Balance Widgets ──────────────────────────── */}
        {positions?.length > 0 && (
          <CoinBalanceWidgets positions={positions} />
        )}

        {/* ── Quick Actions ─────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-3">
          {QUICK_ACTIONS.map(({ icon: Icon, label, tab, href, color }) => (
            href ? (
              <Link key={label} to={createPageUrl(href)}>
                <button className="w-full flex flex-col items-center gap-2 py-4 rounded-2xl border border-white/[0.07] bg-[#111118] hover:bg-[#1a1a28] transition-all active:scale-95">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${color}18` }}>
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <span className="text-xs text-slate-400 font-medium">{label}</span>
                </button>
              </Link>
            ) : (
              <button key={label} onClick={() => setActiveTab(tab)}
                className="flex flex-col items-center gap-2 py-4 rounded-2xl border border-white/[0.07] bg-[#111118] hover:bg-[#1a1a28] transition-all active:scale-95">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${color}18` }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <span className="text-xs text-slate-400 font-medium">{label}</span>
              </button>
            )
          ))}
        </div>

        {/* ── Portfolio Analytics ───────────────────────────── */}
        <div className="rounded-2xl border border-white/[0.07] bg-[#111118] overflow-hidden">
          <div className="px-5 pt-5 pb-3 flex items-center justify-between">
            <h2 className="text-white font-bold text-base">Portfolio Analytics</h2>
            <span className="text-xs text-indigo-400 font-medium px-2.5 py-1 rounded-full" style={{ background: "rgba(99,102,241,0.12)" }}>Live</span>
          </div>
          <PortfolioStats holdings={positions || []} transactions={[]} />
        </div>

        {/* ── Main Tabs ─────────────────────────────────────── */}
        <div className="rounded-2xl border border-white/[0.07] bg-[#111118] overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-4 pt-4">
              <TabsList className="w-full h-10 p-0.5 rounded-xl" style={{ background: "#0d0d15", border: "1px solid #1e2030" }}>
                {[
                  { value: "trade", icon: BarChart3, label: "Trade" },
                  { value: "payments", icon: Send, label: "Payments" },
                  { value: "wallet", icon: Wallet, label: "Wallet" },
                ].map(({ value, icon: Icon, label }) => (
                  <TabsTrigger key={value} value={value}
                    className="flex-1 h-9 rounded-lg text-sm font-medium data-[state=active]:bg-[#1e2030] data-[state=active]:text-white text-slate-500 gap-1.5 transition-all">
                    <Icon className="w-3.5 h-3.5" />{label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value="trade" className="p-4 pt-4">
              <TokenGate gateKey="premium_analytics" tokenHolder={tokenHolder} onConnectWallet={() => setShowWalletModal(true)}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <TradeForm positions={positions || []} />
                  <PositionsList positions={positions || []} />
                </div>
              </TokenGate>
            </TabsContent>

            <TabsContent value="payments" className="p-4 pt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <PaymentForm user={user} />
                <PaymentsList payments={payments || []} user={user} />
              </div>
            </TabsContent>

            <TabsContent value="wallet" className="p-4 pt-4">
              <div className="max-w-md">
                <AddMoneyForm balance={balance} />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* ── ETF Portfolio Banner ──────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl p-5 flex items-center justify-between gap-4"
          style={{ background: "linear-gradient(135deg, #1a1040 0%, #0f0f1a 100%)", border: "1px solid rgba(99,102,241,0.25)" }}>
          <div className="absolute top-0 right-0 w-64 h-full opacity-10 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at right, #6366f1, transparent)" }} />
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 rounded-xl" style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.25)" }}>
              <PieChart className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="text-white font-bold">Custom ETF Portfolios</h3>
                {etfPortfolios?.length > 0 && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                    {etfPortfolios.length}
                  </span>
                )}
              </div>
              <p className="text-slate-500 text-sm">Build diversified portfolios with custom allocations</p>
            </div>
          </div>
          <Link to={createPageUrl("ETFPortfolios")} className="relative z-10 shrink-0">
            <Button className="text-white text-sm font-semibold h-9 px-4 rounded-xl gap-1.5"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "none" }}>
              <span className="hidden sm:inline">Manage</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {showWalletModal && (
        <WalletConnectModal
          onClose={() => setShowWalletModal(false)}
          onConnected={(holder) => setTokenHolder(holder)}
        />
      )}
    </div>
  );
}