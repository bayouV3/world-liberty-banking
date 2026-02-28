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
      <div className="rounded-2xl p-6 text-center" style={{ background: "#0d0d15", border: "1px solid #1e2030" }}>
        <h3 className="text-white font-bold mb-4">Recent Payments</h3>
        <Send className="w-10 h-10 mx-auto mb-2" style={{ color: "#1e2030" }} />
        <p className="text-slate-600 text-sm">No payments yet</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#0d0d15", border: "1px solid #1e2030" }}>
      <div className="px-4 pt-4 pb-2">
        <h3 className="text-white font-bold">Recent Payments</h3>
      </div>
      <div className="p-4 pt-2 space-y-2">
        {payments.map((p) => {
          const isSender = p.sender_email === user?.email;
          const isIncomingRequest = p.type === "request" && p.sender_email === user?.email && p.status === "pending";
          const isOut = isSender && p.type === 'send';

          return (
            <div key={p.id} className="p-3.5 rounded-xl" style={{ background: "#111118", border: "1px solid #1e2030" }}>
              <div className="flex justify-between items-start gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: p.type === 'send' ? "rgba(59,130,246,0.15)" : "rgba(139,92,246,0.15)" }}>
                    {p.type === 'send' ? <Send className="w-4 h-4 text-blue-400" /> : <QrCode className="w-4 h-4 text-violet-400" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-medium text-sm truncate">
                      {p.type === 'send' ? (isSender ? `To ${p.recipient_email}` : `From ${p.sender_email}`) : (isSender ? `Req. from ${p.recipient_email}` : `Req. by ${p.sender_email}`)}
                    </p>
                    {p.note && <p className="text-xs text-slate-500 truncate">{p.note}</p>}
                    <p className="text-xs text-slate-600">{format(new Date(p.created_date), "MMM d, h:mm a")}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className={`font-bold text-sm ${isOut ? 'text-red-400' : 'text-emerald-400'}`}>
                    {isOut ? '-' : '+'}${p.amount?.toFixed(2)}
                  </p>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${statusColors[p.status]}`}>{p.status}</span>
                </div>
              </div>
              {isIncomingRequest && (
                <div className="flex gap-2 mt-2.5">
                  <button className="flex-1 h-8 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1"
                    style={{ background: "#059669" }}
                    onClick={() => respond.mutate({ id: p.id, status: "completed" })}>
                    <Check className="w-3.5 h-3.5" />Pay
                  </button>
                  <button className="flex-1 h-8 rounded-xl text-xs font-semibold text-slate-400 flex items-center justify-center gap-1"
                    style={{ border: "1px solid #1e2030", background: "transparent" }}
                    onClick={() => respond.mutate({ id: p.id, status: "declined" })}>
                    <X className="w-3.5 h-3.5" />Decline
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}