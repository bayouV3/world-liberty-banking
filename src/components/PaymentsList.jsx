import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Send, QrCode, Check, X, Clock } from "lucide-react";
import { format } from "date-fns";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const statusColors = {
  completed: "bg-emerald-500/20 text-emerald-400",
  pending: "bg-yellow-500/20 text-yellow-400",
  declined: "bg-red-500/20 text-red-400"
};

export default function PaymentsList({ payments, user }) {
  const queryClient = useQueryClient();

  const respond = useMutation({
    mutationFn: async ({ id, status }) => {
      await base44.entities.Payment.update(id, { status });
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast.success(status === "completed" ? "Payment completed" : "Payment declined");
    }
  });

  if (!payments?.length) {
    return (
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader><CardTitle className="text-white">Payments</CardTitle></CardHeader>
        <CardContent className="text-center py-12">
          <Send className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No payments yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader><CardTitle className="text-white">Payments</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {payments.map((p) => {
          const isSender = p.sender_email === user?.email;
          const isIncomingRequest = p.type === "request" && p.sender_email === user?.email && p.status === "pending";

          return (
            <div key={p.id} className="p-4 rounded-xl bg-slate-800/50">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${p.type === 'send' ? 'bg-blue-500/20' : 'bg-violet-500/20'}`}>
                    {p.type === 'send' ? <Send className="w-4 h-4 text-blue-400" /> : <QrCode className="w-4 h-4 text-violet-400" />}
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {p.type === 'send' ? (isSender ? `To ${p.recipient_email}` : `From ${p.sender_email}`) : (isSender ? `Request from ${p.recipient_email}` : `Requested by ${p.sender_email}`)}
                    </p>
                    {p.note && <p className="text-sm text-slate-400">{p.note}</p>}
                    <p className="text-xs text-slate-500">{format(new Date(p.created_date), "MMM d, h:mm a")}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${isSender && p.type === 'send' ? 'text-red-400' : 'text-emerald-400'}`}>
                    {isSender && p.type === 'send' ? '-' : '+'}${p.amount?.toFixed(2)}
                  </p>
                  <Badge className={statusColors[p.status]}>{p.status}</Badge>
                </div>
              </div>
              {isIncomingRequest && (
                <div className="flex gap-2 mt-3">
                  <Button size="sm" className="flex-1 bg-emerald-600" onClick={() => respond.mutate({ id: p.id, status: "completed" })}>
                    <Check className="w-4 h-4 mr-1" />Pay
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 border-slate-600" onClick={() => respond.mutate({ id: p.id, status: "declined" })}>
                    <X className="w-4 h-4 mr-1" />Decline
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}