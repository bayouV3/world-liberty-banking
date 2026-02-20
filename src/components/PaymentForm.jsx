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
    <Card className="bg-white/5 border-white/10 backdrop-blur-lg rounded-2xl">
      <CardHeader className="pb-2">
        <Tabs value={type} onValueChange={setType}>
          <TabsList className="w-full bg-slate-800">
            <TabsTrigger value="send" className="flex-1 data-[state=active]:bg-blue-600"><Send className="w-4 h-4 mr-1" />Send</TabsTrigger>
            <TabsTrigger value="request" className="flex-1 data-[state=active]:bg-violet-600"><QrCode className="w-4 h-4 mr-1" />Request</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-slate-300">{type === "send" ? "Recipient" : "From"} Email</Label>
          <Input type="email" value={email} onChange={e => setEmail(e.target.value)} className="bg-slate-800 border-slate-700 text-white" placeholder="email@example.com" />
        </div>
        <div>
          <Label className="text-slate-300">Amount ($)</Label>
          <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="bg-slate-800 border-slate-700 text-white" placeholder="0.00" />
        </div>
        <div>
          <Label className="text-slate-300">Note (optional)</Label>
          <Textarea value={note} onChange={e => setNote(e.target.value)} className="bg-slate-800 border-slate-700 text-white" placeholder="What's it for?" />
        </div>
        <Button onClick={() => payment.mutate()} disabled={payment.isPending || !email || !amount} className={`w-full ${type === 'send' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-violet-600 hover:bg-violet-700'}`}>
          {payment.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : type === "send" ? "Send Money" : "Request Money"}
        </Button>
      </CardContent>
    </Card>
  );
}