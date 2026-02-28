import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowDownLeft, ArrowUpRight, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const assets = [
  { symbol: "AAPL", name: "Apple", price: 178.32 },
  { symbol: "GOOGL", name: "Google", price: 141.56 },
  { symbol: "MSFT", name: "Microsoft", price: 378.91 },
  { symbol: "TSLA", name: "Tesla", price: 248.93 },
  { symbol: "AMZN", name: "Amazon", price: 178.25 },
];

export default function TradeForm({ positions }) {
  const [action, setAction] = useState("buy");
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState("");
  const queryClient = useQueryClient();

  const asset = assets.find(a => a.symbol === symbol);
  const totalValue = asset && quantity ? parseFloat(quantity) * asset.price : 0;
  const holding = positions?.find(p => p.symbol === symbol);

  const trade = useMutation({
    mutationFn: async () => {
      await base44.entities.Trade.create({
        symbol, type: action, quantity: parseFloat(quantity), price: asset.price, total_value: totalValue, status: "executed"
      });

      if (action === "buy") {
        if (holding) {
          const newQty = holding.quantity + parseFloat(quantity);
          const newAvg = ((holding.quantity * holding.avg_cost) + totalValue) / newQty;
          await base44.entities.Position.update(holding.id, { quantity: newQty, avg_cost: newAvg, current_price: asset.price });
        } else {
          await base44.entities.Position.create({ symbol, name: asset.name, quantity: parseFloat(quantity), avg_cost: asset.price, current_price: asset.price });
        }
      } else if (holding) {
        const newQty = holding.quantity - parseFloat(quantity);
        if (newQty <= 0) await base44.entities.Position.delete(holding.id);
        else await base44.entities.Position.update(holding.id, { quantity: newQty, current_price: asset.price });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      toast.success(`${action === 'buy' ? 'Bought' : 'Sold'} ${quantity} ${symbol}`);
      setQuantity(""); setSymbol("");
    }
  });

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#0d0d15", border: "1px solid #1e2030" }}>
      <div className="p-4 pb-3">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold">Place Order</h3>
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
        <div className="space-y-3">
          <div>
            <Label className="text-slate-500 text-xs mb-1.5 block">Asset</Label>
            <Select value={symbol} onValueChange={setSymbol}>
              <SelectTrigger className="h-11 text-white rounded-xl" style={{ background: "#111118", border: "1px solid #1e2030" }}>
                <SelectValue placeholder="Select asset" />
              </SelectTrigger>
              <SelectContent style={{ background: "#111118", border: "1px solid #1e2030" }}>
                {assets.map(a => (
                  <SelectItem key={a.symbol} value={a.symbol} className="text-white focus:bg-white/10">
                    <span className="font-semibold">{a.symbol}</span>
                    <span className="text-slate-400 ml-2">${a.price}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-slate-500 text-xs mb-1.5 block">Quantity</Label>
            <Input type="number" value={quantity} onChange={e => setQuantity(e.target.value)}
              className="h-11 text-white rounded-xl"
              style={{ background: "#111118", border: "1px solid #1e2030" }}
              placeholder="0" />
          </div>
          {totalValue > 0 && (
            <div className="flex justify-between items-center px-4 py-3 rounded-xl" style={{ background: "#111118", border: "1px solid #1e2030" }}>
              <span className="text-slate-500 text-sm">Total</span>
              <span className="font-bold text-white">${totalValue.toFixed(2)}</span>
            </div>
          )}
          <button onClick={() => trade.mutate()} disabled={trade.isPending || !symbol || !quantity}
            className="w-full h-11 rounded-xl font-semibold text-white text-sm transition-opacity disabled:opacity-40"
            style={{ background: action === 'buy' ? "#059669" : "#e11d48" }}>
            {trade.isPending ? <Loader2 className="w-4 h-4 animate-spin inline" /> : `${action === 'buy' ? 'Buy' : 'Sell'} ${symbol || 'Asset'}`}
          </button>
        </div>
      </div>
    </div>
  );
}