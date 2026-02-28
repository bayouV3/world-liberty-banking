import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDownLeft, ArrowUpRight, Loader2, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import AssetChart from "@/components/trading/AssetChart";
import { useAssetPrices } from "@/components/trading/useAssetPrices";

const ASSETS = [
  { symbol: "AAPL", name: "Apple" },
  { symbol: "GOOGL", name: "Google" },
  { symbol: "MSFT", name: "Microsoft" },
  { symbol: "TSLA", name: "Tesla" },
  { symbol: "AMZN", name: "Amazon" },
  { symbol: "BTC", name: "Bitcoin" },
  { symbol: "ETH", name: "Ethereum" },
  { symbol: "SOL", name: "Solana" },
];

const ALL_SYMBOLS = ASSETS.map(a => a.symbol);

export default function TradeForm({ positions }) {
  const [action, setAction] = useState("buy");
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const queryClient = useQueryClient();

  const { prices, loading: pricesLoading } = useAssetPrices(ALL_SYMBOLS);
  const currentPrice = symbol ? (prices[symbol] || 0) : 0;
  const asset = ASSETS.find(a => a.symbol === symbol);
  const totalValue = currentPrice && quantity ? parseFloat(quantity) * currentPrice : 0;
  const holding = positions?.find(p => p.symbol === symbol);

  const trade = useMutation({
    mutationFn: async () => {
      const price = currentPrice;
      const total = parseFloat(quantity) * price;
      await base44.entities.Trade.create({
        symbol, type: action, quantity: parseFloat(quantity), price, total_value: total, status: "executed"
      });

      if (action === "buy") {
        if (holding) {
          const newQty = holding.quantity + parseFloat(quantity);
          const newAvg = ((holding.quantity * holding.avg_cost) + total) / newQty;
          await base44.entities.Position.update(holding.id, { quantity: newQty, avg_cost: newAvg, current_price: price });
        } else {
          await base44.entities.Position.create({ symbol, name: asset.name, quantity: parseFloat(quantity), avg_cost: price, current_price: price });
        }
      } else if (holding) {
        const newQty = holding.quantity - parseFloat(quantity);
        if (newQty <= 0) await base44.entities.Position.delete(holding.id);
        else await base44.entities.Position.update(holding.id, { quantity: newQty, current_price: price });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      toast.success(`${action === 'buy' ? 'Bought' : 'Sold'} ${quantity} ${symbol}`);
      setQuantity(""); setSymbol(""); setStopLoss(""); setTakeProfit("");
    }
  });

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#0d0d15", border: "1px solid #1e2030" }}>
      <div className="p-4 pb-3">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold">Place Order</h3>
          <div className="flex items-center gap-2">
            {pricesLoading && <RefreshCw className="w-3 h-3 text-indigo-400 animate-spin" />}
            <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid #1e2030" }}>
              {["buy", "sell"].map(a => (
                <button key={a} onClick={() => setAction(a)}
                  className="px-4 py-1.5 text-sm font-semibold transition-all capitalize"
                  style={action === a
                    ? { background: a === "buy" ? "#059669" : "#e11d48", color: "white" }
                    : { background: "transparent", color: "#64748b" }
                  }>
                  {a === "buy" ? <><ArrowDownLeft className="w-3.5 h-3.5 inline mr-1" />Buy</> : <><ArrowUpRight className="w-3.5 h-3.5 inline mr-1" />Sell</>}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {/* Asset select with live price */}
          <div>
            <Label className="text-slate-500 text-xs mb-1.5 block">Asset</Label>
            <Select value={symbol} onValueChange={setSymbol}>
              <SelectTrigger className="h-11 text-white rounded-xl" style={{ background: "#111118", border: "1px solid #1e2030" }}>
                <SelectValue placeholder="Select asset" />
              </SelectTrigger>
              <SelectContent style={{ background: "#111118", border: "1px solid #1e2030" }}>
                {ASSETS.map(a => (
                  <SelectItem key={a.symbol} value={a.symbol} className="text-white focus:bg-white/10">
                    <span className="font-semibold">{a.symbol}</span>
                    <span className="text-slate-400 ml-2 text-xs">{a.name}</span>
                    {prices[a.symbol] && (
                      <span className="text-indigo-300 ml-2 text-xs">${prices[a.symbol].toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Live price + chart */}
          {symbol && currentPrice > 0 && (
            <>
              <div className="flex items-center justify-between px-4 py-2.5 rounded-xl" style={{ background: "#111118", border: "1px solid #1e2030" }}>
                <span className="text-slate-500 text-xs">Live Price</span>
                <span className="text-white font-bold">${currentPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
              <AssetChart symbol={symbol} currentPrice={currentPrice} />
            </>
          )}

          {/* Quantity */}
          <div>
            <Label className="text-slate-500 text-xs mb-1.5 block">Quantity</Label>
            <Input type="number" value={quantity} onChange={e => setQuantity(e.target.value)}
              className="h-11 text-white rounded-xl"
              style={{ background: "#111118", border: "1px solid #1e2030" }}
              placeholder="0" />
          </div>

          {/* Stop-loss / Take-profit toggle */}
          <button onClick={() => setShowAdvanced(v => !v)}
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
            {showAdvanced ? "− Hide" : "+ Show"} Stop-Loss / Take-Profit
          </button>

          {showAdvanced && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-slate-500 text-xs mb-1.5 block">Stop-Loss ($)</Label>
                <Input type="number" value={stopLoss} onChange={e => setStopLoss(e.target.value)}
                  className="h-10 text-white rounded-xl text-sm"
                  style={{ background: "#111118", border: "1px solid #e11d4830" }}
                  placeholder="0.00" />
              </div>
              <div>
                <Label className="text-slate-500 text-xs mb-1.5 block">Take-Profit ($)</Label>
                <Input type="number" value={takeProfit} onChange={e => setTakeProfit(e.target.value)}
                  className="h-10 text-white rounded-xl text-sm"
                  style={{ background: "#111118", border: "1px solid #05966930" }}
                  placeholder="0.00" />
              </div>
              {stopLoss && currentPrice > 0 && (
                <div className="col-span-2 text-xs text-slate-500 px-1">
                  Stop at <span className="text-rose-400">${stopLoss}</span>
                  {takeProfit && <> · Take profit at <span className="text-emerald-400">${takeProfit}</span></>}
                </div>
              )}
            </div>
          )}

          {/* Total */}
          {totalValue > 0 && (
            <div className="flex justify-between items-center px-4 py-3 rounded-xl" style={{ background: "#111118", border: "1px solid #1e2030" }}>
              <span className="text-slate-500 text-sm">Total</span>
              <span className="font-bold text-white">${totalValue.toFixed(2)}</span>
            </div>
          )}

          <button onClick={() => trade.mutate()} disabled={trade.isPending || !symbol || !quantity || currentPrice === 0}
            className="w-full h-11 rounded-xl font-semibold text-white text-sm transition-opacity disabled:opacity-40"
            style={{ background: action === 'buy' ? "#059669" : "#e11d48" }}>
            {trade.isPending ? <Loader2 className="w-4 h-4 animate-spin inline" /> : `${action === 'buy' ? 'Buy' : 'Sell'} ${symbol || 'Asset'}`}
          </button>
        </div>
      </div>
    </div>
  );
}