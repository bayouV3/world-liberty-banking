import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Minus, Loader2, DollarSign } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function AddMoneyForm({ balance }) {
  const [type, setType] = useState("deposit");
  const [amount, setAmount] = useState("");
  const queryClient = useQueryClient();

  const currentBalance = balance?.amount || 0;

  const transaction = useMutation({
    mutationFn: async () => {
      const amountNum = parseFloat(amount);
      if (type === "withdraw" && amountNum > currentBalance) {
        throw new Error("Insufficient balance");
      }
      const newBalance = type === "deposit" ? currentBalance + amountNum : currentBalance - amountNum;
      if (balance?.id) {
        await base44.entities.Balance.update(balance.id, { amount: newBalance });
      } else {
        await base44.entities.Balance.create({ amount: amountNum });
      }
    },
    onMutate: async () => {
      const amountNum = parseFloat(amount);
      await queryClient.cancelQueries({ queryKey: ['balance'] });
      const previous = queryClient.getQueryData(['balance']);
      const newBalance = type === "deposit" ? currentBalance + amountNum : currentBalance - amountNum;
      queryClient.setQueryData(['balance'], (old) => old?.map((b, i) => i === 0 ? { ...b, amount: newBalance } : b) || [{ amount: newBalance }]);
      return { previous };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      toast.success(type === "deposit" ? `Added $${amount} to balance` : `Withdrew $${amount}`);
      setAmount("");
    },
    onError: (err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(['balance'], context.previous);
      toast.error(err.message || "Transaction failed");
    }
  });

  const quickAmounts = [50, 100, 250, 500, 1000];

  return (
    <div className="rounded-2xl p-4" style={{ background: "#0d0d15", border: "1px solid #1e2030" }}>
      {/* Balance */}
      <div className="flex items-center gap-3 mb-5 p-4 rounded-xl" style={{ background: "#111118", border: "1px solid #1e2030" }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(52,211,153,0.12)" }}>
          <DollarSign className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <p className="text-slate-500 text-xs">Cash Balance</p>
          <p className="text-2xl font-black text-white">${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold">Add / Withdraw</h3>
        <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid #1e2030" }}>
          {[
            { val: "deposit", icon: Plus, color: "#059669" },
            { val: "withdraw", icon: Minus, color: "#ea580c" },
          ].map(({ val, icon: Icon, color }) => (
            <button key={val} onClick={() => setType(val)}
              className="px-4 py-1.5 text-sm font-semibold transition-all flex items-center gap-1 capitalize"
              style={type === val ? { background: color, color: "white" } : { background: "transparent", color: "#64748b" }}>
              <Icon className="w-3.5 h-3.5" />{val}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <Label className="text-slate-500 text-xs mb-1.5 block">Amount ($)</Label>
          <Input type="number" value={amount} onChange={e => setAmount(e.target.value)}
            className="h-11 text-white text-lg rounded-xl" placeholder="0.00"
            style={{ background: "#111118", border: "1px solid #1e2030" }} />
        </div>

        <div className="flex gap-2 flex-wrap">
          {quickAmounts.map(amt => (
            <button key={amt} onClick={() => setAmount(amt.toString())}
              className="px-3 py-1.5 rounded-xl text-sm font-medium text-slate-400 transition-all hover:text-white"
              style={{ border: "1px solid #1e2030", background: "transparent" }}>
              ${amt}
            </button>
          ))}
        </div>

        <button onClick={() => transaction.mutate()} disabled={transaction.isPending || !amount || parseFloat(amount) <= 0}
          className="w-full h-11 rounded-xl font-semibold text-white text-sm transition-opacity disabled:opacity-40"
          style={{ background: type === 'deposit' ? "#059669" : "#ea580c" }}>
          {transaction.isPending ? <Loader2 className="w-4 h-4 animate-spin inline" /> : type === "deposit" ? "Add Money" : "Withdraw Money"}
        </button>
      </div>
    </div>
  );
}