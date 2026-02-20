import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Loader2, X, PieChart } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

const POPULAR_ASSETS = [
  { symbol: "BTC", name: "Bitcoin" },
  { symbol: "ETH", name: "Ethereum" },
  { symbol: "AAPL", name: "Apple" },
  { symbol: "MSFT", name: "Microsoft" },
  { symbol: "GOOGL", name: "Alphabet" },
  { symbol: "TSLA", name: "Tesla" },
  { symbol: "NVDA", name: "NVIDIA" },
  { symbol: "SOL", name: "Solana" },
  { symbol: "WLFI", name: "World Liberty Financial" },
];

export default function CreateETFForm({ onClose, onCreated }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [allocations, setAllocations] = useState([{ symbol: "", name: "", weight: "" }]);

  const totalWeight = allocations.reduce((sum, a) => sum + (parseFloat(a.weight) || 0), 0);

  const addAllocation = () => setAllocations([...allocations, { symbol: "", name: "", weight: "" }]);

  const removeAllocation = (i) => setAllocations(allocations.filter((_, idx) => idx !== i));

  const updateAllocation = (i, field, value) => {
    const updated = [...allocations];
    updated[i] = { ...updated[i], [field]: value };
    setAllocations(updated);
  };

  const quickAdd = (asset) => {
    const exists = allocations.find(a => a.symbol === asset.symbol);
    if (exists) return;
    const empty = allocations.findIndex(a => !a.symbol);
    if (empty >= 0) {
      updateAllocation(empty, "symbol", asset.symbol);
      updateAllocation(empty, "name", asset.name);
    } else {
      setAllocations([...allocations, { symbol: asset.symbol, name: asset.name, weight: "" }]);
    }
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const validAllocations = allocations.filter(a => a.symbol && a.weight);
      if (!name) throw new Error("Portfolio name is required");
      if (validAllocations.length < 2) throw new Error("Add at least 2 allocations");
      if (Math.abs(totalWeight - 100) > 0.01) throw new Error("Weights must total exactly 100%");
      await base44.entities.ETFPortfolio.create({
        name,
        description,
        allocations: validAllocations.map(a => ({ ...a, weight: parseFloat(a.weight) })),
        status: "active"
      });
    },
    onSuccess: () => {
      toast.success("Portfolio created!");
      onCreated();
    },
    onError: (err) => toast.error(err.message)
  });

  return (
    <Card className="bg-slate-900 border-slate-700 shadow-2xl">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/20">
            <PieChart className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">Create Custom ETF</h2>
            <p className="text-slate-400 text-sm">Build your diversified portfolio</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-slate-300 mb-1 block">Portfolio Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Tech Growth 2026" className="bg-slate-800 border-slate-700 text-white" />
          </div>
          <div>
            <Label className="text-slate-300 mb-1 block">Description (optional)</Label>
            <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Strategy overview..." className="bg-slate-800 border-slate-700 text-white" />
          </div>
        </div>

        {/* Quick Add */}
        <div>
          <Label className="text-slate-400 text-xs uppercase tracking-wider mb-2 block">Quick Add Popular Assets</Label>
          <div className="flex flex-wrap gap-2">
            {POPULAR_ASSETS.map(asset => (
              <button
                key={asset.symbol}
                onClick={() => quickAdd(asset)}
                className="px-3 py-1 rounded-full text-xs font-medium bg-slate-800 hover:bg-blue-600/30 border border-slate-700 hover:border-blue-500 text-slate-300 hover:text-blue-300 transition-all"
              >
                {asset.symbol}
              </button>
            ))}
          </div>
        </div>

        {/* Allocations */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-slate-300">Allocations</Label>
            <span className={`text-sm font-semibold ${Math.abs(totalWeight - 100) < 0.01 ? 'text-emerald-400' : totalWeight > 100 ? 'text-red-400' : 'text-slate-400'}`}>
              {totalWeight.toFixed(1)}% / 100%
            </span>
          </div>
          <div className="space-y-2">
            {allocations.map((alloc, i) => (
              <div key={i} className="flex gap-2 items-center">
                <Input
                  value={alloc.symbol}
                  onChange={e => updateAllocation(i, "symbol", e.target.value.toUpperCase())}
                  placeholder="SYMBOL"
                  className="bg-slate-800 border-slate-700 text-white w-24 font-mono"
                />
                <Input
                  value={alloc.name}
                  onChange={e => updateAllocation(i, "name", e.target.value)}
                  placeholder="Asset name"
                  className="bg-slate-800 border-slate-700 text-white flex-1"
                />
                <div className="relative w-24">
                  <Input
                    type="number"
                    value={alloc.weight}
                    onChange={e => updateAllocation(i, "weight", e.target.value)}
                    placeholder="0"
                    className="bg-slate-800 border-slate-700 text-white pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
                </div>
                {allocations.length > 1 && (
                  <Button variant="ghost" size="icon" onClick={() => removeAllocation(i)} className="text-slate-500 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={addAllocation} className="mt-3 border-slate-700 text-slate-300 hover:bg-slate-800">
            <Plus className="w-3 h-3 mr-1" /> Add Asset
          </Button>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onClose} className="border-slate-700 text-slate-300 hover:bg-slate-800">Cancel</Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="flex-1 bg-blue-600 hover:bg-blue-500"
          >
            {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Portfolio"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}