import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, PieChart, ArrowLeft } from "lucide-react";
import CreateETFForm from "@/components/etf/CreateETFForm";
import ETFCard from "@/components/etf/ETFCard";
import TokenGate from "@/components/TokenGate";
import WalletConnectModal from "@/components/WalletConnectModal";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ETFPortfolios() {
  const [showCreate, setShowCreate] = useState(false);
  const [tokenHolder, setTokenHolder] = useState(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: portfolios, isLoading } = useQuery({
    queryKey: ["etf_portfolios"],
    queryFn: () => base44.entities.ETFPortfolio.list("-created_date"),
    initialData: []
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ETFPortfolio.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["etf_portfolios"] })
  });

  return (
    <>
      <div className="min-h-screen" style={{ background: "#1a1c1e" }}>
        {/* ── Page Header ─────────────────────────────────── */}
        <div className="relative px-5 pt-8 pb-8 overflow-hidden"
          style={{ background: "linear-gradient(145deg, #232628, #1e2022)", borderBottom: "1px solid #3a3d42" }}>
          <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
            style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)" }} />
          <div className="max-w-6xl mx-auto relative z-10">
            <Link to={createPageUrl("Dashboard")} className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-5 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </Link>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl" style={{ background: "linear-gradient(145deg, #333740, #282b2f)", border: "1px solid #44474c" }}>
                  <PieChart className="w-7 h-7 text-slate-300" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-slate-100 tracking-tight">ETF Portfolios</h1>
                  <p className="text-slate-500 text-sm mt-0.5">Build and manage diversified index-style portfolios</p>
                </div>
              </div>
              <Button
                onClick={() => setShowCreate(true)}
                className="text-slate-100 font-semibold h-10 px-5 rounded-xl gap-2 shrink-0"
                style={{ background: "linear-gradient(145deg, #4a4e57, #35383d)", border: "1px solid #555960" }}
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Portfolio</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 md:px-5 py-6">
          <TokenGate gateKey="etf_portfolios" tokenHolder={tokenHolder} onConnectWallet={() => setShowWalletModal(true)}>
            {showCreate && (
              <div className="mb-6">
                <CreateETFForm
                  onClose={() => setShowCreate(false)}
                  onCreated={() => {
                    setShowCreate(false);
                    queryClient.invalidateQueries({ queryKey: ["etf_portfolios"] });
                  }}
                />
              </div>
            )}

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-64 rounded-2xl animate-pulse" style={{ background: "#232628" }} />
                ))}
              </div>
            ) : portfolios?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-28 text-center">
                <div className="p-6 rounded-3xl mb-6" style={{ background: "linear-gradient(145deg, #2a2d30, #202326)", border: "1px solid #44474c" }}>
                  <PieChart className="w-12 h-12 text-slate-400 mx-auto" />
                </div>
                <h3 className="text-xl font-bold text-slate-100 mb-2">No portfolios yet</h3>
                <p className="text-slate-500 mb-6 text-sm max-w-xs">Create your first custom ETF-style portfolio to start building wealth</p>
                <Button onClick={() => setShowCreate(true)}
                  className="text-slate-100 font-semibold h-10 px-6 rounded-xl gap-2"
                  style={{ background: "linear-gradient(145deg, #4a4e57, #35383d)", border: "1px solid #555960" }}>
                  <Plus className="w-4 h-4" />
                  Create Portfolio
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {portfolios.map(portfolio => (
                  <ETFCard
                    key={portfolio.id}
                    portfolio={portfolio}
                    onDelete={() => deleteMutation.mutate(portfolio.id)}
                  />
                ))}
              </div>
            )}
          </TokenGate>
        </div>
      </div>

      {showWalletModal && (
        <WalletConnectModal
          onClose={() => setShowWalletModal(false)}
          onConnected={(holder) => setTokenHolder(holder)}
        />
      )}
    </>
  );
}