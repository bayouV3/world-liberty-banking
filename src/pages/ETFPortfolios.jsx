import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp } from "lucide-react";
import CreateETFForm from "@/components/etf/CreateETFForm.js";
import ETFCard from "@/components/etf/ETFCard.js";

export default function ETFPortfolios() {
  const [showCreate, setShowCreate] = useState(false);
  const queryClient = useQueryClient();

  const { data: portfolios, isLoading } = useQuery({
    queryKey: ["etf_portfolios"],
    queryFn: () => base44.entities.ETFPortfolio.list("-created_date")
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ETFPortfolio.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["etf_portfolios"] })
  });

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero Banner */}
      <div className="relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1600&q=80"
          alt="Finance Banner"
          className="w-full h-56 object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
        <div className="absolute inset-0 flex items-center px-8 md:px-16">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-blue-500/20 border border-blue-500/30">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-blue-400 font-semibold text-sm uppercase tracking-widest">Custom ETFs</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-1">My Portfolios</h1>
            <p className="text-slate-400 text-lg">Build and manage diversified ETF-style portfolios</p>
          </div>
        </div>
        <div className="absolute top-4 right-8">
          <Button
            onClick={() => setShowCreate(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Portfolio
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-6">
        {showCreate && (
          <CreateETFForm
            onClose={() => setShowCreate(false)}
            onCreated={() => {
              setShowCreate(false);
              queryClient.invalidateQueries({ queryKey: ["etf_portfolios"] });
            }}
          />
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 rounded-2xl bg-slate-900 animate-pulse" />
            ))}
          </div>
        ) : portfolios?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <img
              src="https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&q=80"
              alt="Empty"
              className="w-32 h-32 rounded-2xl object-cover opacity-40 mb-6"
            />
            <h3 className="text-xl font-semibold text-white mb-2">No portfolios yet</h3>
            <p className="text-slate-400 mb-6">Create your first custom ETF-style portfolio</p>
            <Button onClick={() => setShowCreate(true)} className="bg-blue-600 hover:bg-blue-500">
              <Plus className="w-4 h-4 mr-2" />
              Create Portfolio
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolios.map(portfolio => (
              <ETFCard
                key={portfolio.id}
                portfolio={portfolio}
                onDelete={() => deleteMutation.mutate(portfolio.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}