import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Plus, Star, TrendingUp, TrendingDown, RefreshCw, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLivePrices, ALL_ASSETS } from "@/components/watchlist/useLivePrices";
import WatchlistRow from "@/components/watchlist/WatchlistRow";
import AddAssetModal from "@/components/watchlist/AddAssetModal";
import { motion } from "framer-motion";
import PullToRefresh from "@/components/PullToRefresh";

const TYPE_TABS = ["All", "Stocks", "Crypto", "Forex"];

// Market overview cards (static but animated)
const MARKET_OVERVIEW = [
  { label: "S&P 500", value: "5,234.18", change: 0.42, symbol: "SPX" },
  { label: "Nasdaq 100", value: "18,421.32", change: 1.12, symbol: "NDX" },
  { label: "Bitcoin", value: "67,234.50", change: 2.87, symbol: "BTC" },
  { label: "Gold", value: "2,312.40", change: 0.28, symbol: "XAU" },
];

export default function Watchlist() {
  const [showAdd, setShowAdd] = useState(false);
  const [typeTab, setTypeTab] = useState("All");
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["watchlist"],
    queryFn: () => base44.entities.WatchlistItem.list("-created_date"),
    initialData: [],
  });

  const addMutation = useMutation({
    mutationFn: (asset) => base44.entities.WatchlistItem.create({
      symbol: asset.symbol,
      name: asset.name,
      asset_type: asset.type,
    }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["watchlist"] }); setShowAdd(false); }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.WatchlistItem.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["watchlist"] }),
  });

  const symbols = useMemo(() => items.map(i => i.symbol), [items]);
  const { prices, changes, loading: pricesLoading } = useLivePrices(symbols);

  const filtered = items.filter(item => {
    if (typeTab === "All") return true;
    if (typeTab === "Stocks") return item.asset_type === "stock";
    if (typeTab === "Crypto") return item.asset_type === "crypto";
    if (typeTab === "Forex") return item.asset_type === "forex";
    return true;
  });

  // Summary stats
  const gainers = items.filter(i => (changes[i.symbol] || 0) > 0).length;
  const losers = items.filter(i => (changes[i.symbol] || 0) < 0).length;

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["watchlist"] });
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen" style={{ background: "#1a1c1e" }}>
      {/* Header */}
      <div className="relative px-5 pt-8 pb-6 overflow-hidden"
        style={{ background: "linear-gradient(145deg, #232628, #1e2022)", borderBottom: "1px solid #3a3d42" }}>
        <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)" }} />

        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl" style={{ background: "linear-gradient(145deg, #2a2d30, #202326)", border: "1px solid #44474c" }}>
                <Star className="w-5 h-5 text-slate-300" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-100 tracking-tight">Watchlist</h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#5ecb94" }} />
                  <span className="text-xs text-slate-500">Live prices</span>
                  {items.length > 0 && (
                    <>
                      <span className="text-slate-700">·</span>
                      <span className="text-xs" style={{ color: "#5ecb94" }}>{gainers}↑</span>
                      <span className="text-xs" style={{ color: "#e87070" }}>{losers}↓</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <Button onClick={() => setShowAdd(true)}
              className="h-9 px-4 rounded-xl gap-2 text-sm font-semibold text-slate-100"
              style={{ background: "linear-gradient(145deg, #4a4e57, #35383d)", border: "1px solid #555960" }}>
              <Plus className="w-4 h-4" /> Add Asset
            </Button>
          </div>

          {/* Market Overview bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {MARKET_OVERVIEW.map((m, i) => {
              const up = m.change >= 0;
              return (
                <motion.div key={m.symbol} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  className="px-4 py-3 rounded-xl"
                  style={{ background: "linear-gradient(145deg, #2a2d30, #202326)", border: "1px solid #3a3d42" }}>
                  <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-widest">{m.label}</p>
                  <p className="text-base font-bold font-mono text-slate-100">{m.value}</p>
                  <p className="text-xs font-semibold mt-0.5" style={{ color: up ? "#5ecb94" : "#e87070" }}>
                    {up ? "+" : ""}{m.change.toFixed(2)}%
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-5 py-6 space-y-4">
        {/* Tab filters */}
        <div className="flex items-center gap-1 p-1 rounded-xl self-start"
          style={{ background: "#161819", border: "1px solid #2e3236", width: "fit-content" }}>
          {TYPE_TABS.map(tab => (
            <button key={tab} onClick={() => setTypeTab(tab)}
              className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
              style={typeTab === tab
                ? { background: "linear-gradient(145deg, #2e3236, #262a2e)", color: "#e8eaec", border: "1px solid #44474c" }
                : { color: "#64748b", background: "transparent", border: "1px solid transparent" }}>
              {tab}
            </button>
          ))}
        </div>

        {/* Watchlist rows */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: "#232628" }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-6 rounded-3xl mb-5" style={{ background: "linear-gradient(145deg, #2a2d30, #202326)", border: "1px solid #44474c" }}>
              <Star className="w-10 h-10 text-slate-600 mx-auto" />
            </div>
            <h3 className="text-lg font-bold text-slate-300 mb-2">
              {typeTab === "All" ? "Your watchlist is empty" : `No ${typeTab.toLowerCase()} tracked yet`}
            </h3>
            <p className="text-slate-600 text-sm mb-5">Add assets to track their live prices and movements</p>
            <Button onClick={() => setShowAdd(true)}
              className="h-9 px-5 rounded-xl gap-2 text-sm text-slate-100"
              style={{ background: "linear-gradient(145deg, #4a4e57, #35383d)", border: "1px solid #555960" }}>
              <Plus className="w-4 h-4" /> Add Asset
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((item, i) => (
              <WatchlistRow
                key={item.id}
                item={item}
                price={prices[item.symbol]}
                change={changes[item.symbol]}
                onDelete={(id) => deleteMutation.mutate(id)}
                index={i}
              />
            ))}
          </div>
        )}
      </div>

      {showAdd && (
        <AddAssetModal
          existing={items}
          onAdd={(asset) => addMutation.mutate(asset)}
          onClose={() => setShowAdd(false)}
        />
      )}
      </div>
    </PullToRefresh>
  );
}