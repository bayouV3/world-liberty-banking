import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, QrCode, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function PaymentForm({ user }) {
  const [type, setType] = useState("send");
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const queryClient = useQueryClient();

  const payment = useMutation({
    mutationFn: async () => {
      await base44.entities.Payment.create({
        recipient_email: type === "send" ? email : user?.email,
        sender_email: type === "send" ? user?.email : email,
        amount: parseFloat(amount),
        note,
        type,
        status: type === "send" ? "completed" : "pending"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast.success(type === "send" ? `Sent $${amount} to ${email}` : `Requested $${amount} from ${email}`);
      setEmail(""); setAmount(""); setNote("");
    }
  });

  return (
    <div className="rounded-2xl p-4" style={{ background: "#0d0d15", border: "1px solid #1e2030" }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold">Transfer</h3>
        <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid #1e2030" }}>
          {[{ val: "send", label: "Send", icon: Send, color: "#3b82f6" }, { val: "request", label: "Request", icon: QrCode, color: "#8b5cf6" }].map(({ val, label, icon: Icon, color }) => (
            <button key={val} onClick={() => setType(val)}
              className="px-4 py-1.5 text-sm font-semibold transition-all flex items-center gap-1.5"
              style={type === val ? { background: color, color: "white" } : { background: "transparent", color: "#64748b" }}>
              <Icon className="w-3.5 h-3.5" />{label}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <div>
          <Label className="text-slate-500 text-xs mb-1.5 block">{type === "send" ? "Recipient" : "Request From"} Email</Label>
          <Input type="email" value={email} onChange={e => setEmail(e.target.value)}
            className="h-11 text-white rounded-xl" placeholder="email@example.com"
            style={{ background: "#111118", border: "1px solid #1e2030" }} />
        </div>
        <div>
          <Label className="text-slate-500 text-xs mb-1.5 block">Amount ($)</Label>
          <Input type="number" value={amount} onChange={e => setAmount(e.target.value)}
            className="h-11 text-white rounded-xl" placeholder="0.00"
            style={{ background: "#111118", border: "1px solid #1e2030" }} />
        </div>
        <div>
          <Label className="text-slate-500 text-xs mb-1.5 block">Note (optional)</Label>
          <Textarea value={note} onChange={e => setNote(e.target.value)}
            className="text-white rounded-xl resize-none" placeholder="What's it for?"
            style={{ background: "#111118", border: "1px solid #1e2030" }} rows={2} />
        </div>
        <button onClick={() => payment.mutate()} disabled={payment.isPending || !email || !amount}
          className="w-full h-11 rounded-xl font-semibold text-white text-sm transition-opacity disabled:opacity-40"
          style={{ background: type === 'send' ? "#3b82f6" : "#8b5cf6" }}>
          {payment.isPending ? <Loader2 className="w-4 h-4 animate-spin inline" /> : type === "send" ? "Send Money" : "Request Money"}
        </button>
      </div>
    </div>
  );
}