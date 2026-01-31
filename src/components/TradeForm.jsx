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
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="pb-2">
        <Tabs value={action} onValueChange={setAction}>
          <TabsList className="w-full bg-slate-800">
            <TabsTrigger value="buy" className="flex-1 data-[state=active]:bg-emerald-600"><ArrowDownLeft className="w-4 h-4 mr-1" />Buy</TabsTrigger>
            <TabsTrigger value="sell" className="flex-1 data-[state=active]:bg-red-600"><ArrowUpRight className="w-4 h-4 mr-1" />Sell</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-slate-300">Asset</Label>
          <Select value={symbol} onValueChange={setSymbol}>
            <SelectTrigger className="bg-slate-800 border-slate-700 text-white"><SelectValue placeholder="Select asset" /></SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {assets.map(a => <SelectItem key={a.symbol} value={a.symbol} className="text-white">{a.symbol} - ${a.price}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-slate-300">Quantity</Label>
          <Input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} className="bg-slate-800 border-slate-700 text-white" placeholder="0" />
        </div>
        {totalValue > 0 && (
          <div className="p-3 rounded-lg bg-slate-800 flex justify-between">
            <span className="text-slate-400">Total</span>
            <span className="font-bold text-white">${totalValue.toFixed(2)}</span>
          </div>
        )}
        <Button onClick={() => trade.mutate()} disabled={trade.isPending || !symbol || !quantity} className={`w-full ${action === 'buy' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}>
          {trade.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : `${action === 'buy' ? 'Buy' : 'Sell'} ${symbol || 'Asset'}`}
        </Button>
      </CardContent>
    </Card>
  );
}