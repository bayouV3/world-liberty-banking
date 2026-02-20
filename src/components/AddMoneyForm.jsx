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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      toast.success(type === "deposit" ? `Added $${amount} to balance` : `Withdrew $${amount}`);
      setAmount("");
    },
    onError: (err) => {
      toast.error(err.message || "Transaction failed");
    }
  });

  const quickAmounts = [50, 100, 250, 500, 1000];

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-lg rounded-2xl">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Cash Balance</p>
              <p className="text-2xl font-bold text-white">${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>
        <Tabs value={type} onValueChange={setType}>
          <TabsList className="w-full bg-slate-800">
            <TabsTrigger value="deposit" className="flex-1 data-[state=active]:bg-emerald-600">
              <Plus className="w-4 h-4 mr-1" />Deposit
            </TabsTrigger>
            <TabsTrigger value="withdraw" className="flex-1 data-[state=active]:bg-orange-600">
              <Minus className="w-4 h-4 mr-1" />Withdraw
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-slate-300">Amount ($)</Label>
          <Input 
            type="number" 
            value={amount} 
            onChange={e => setAmount(e.target.value)} 
            className="bg-slate-800 border-slate-700 text-white text-lg" 
            placeholder="0.00" 
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          {quickAmounts.map(amt => (
            <Button 
              key={amt} 
              variant="outline" 
              size="sm"
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
              onClick={() => setAmount(amt.toString())}
            >
              ${amt}
            </Button>
          ))}
        </div>

        <Button 
          onClick={() => transaction.mutate()} 
          disabled={transaction.isPending || !amount || parseFloat(amount) <= 0} 
          className={`w-full ${type === 'deposit' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-orange-600 hover:bg-orange-700'}`}
        >
          {transaction.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : type === "deposit" ? "Add Money" : "Withdraw Money"}
        </Button>
      </CardContent>
    </Card>
  );
}