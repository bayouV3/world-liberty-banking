import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownLeft, Send, Download, Clock, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";

const typeConfig = {
  buy: { icon: ArrowDownLeft, color: "text-emerald-400", bg: "bg-emerald-500/20", label: "Bought" },
  sell: { icon: ArrowUpRight, color: "text-red-400", bg: "bg-red-500/20", label: "Sold" },
  send: { icon: Send, color: "text-blue-400", bg: "bg-blue-500/20", label: "Sent" },
  receive: { icon: Download, color: "text-violet-400", bg: "bg-violet-500/20", label: "Received" },
  deposit: { icon: ArrowDownLeft, color: "text-emerald-400", bg: "bg-emerald-500/20", label: "Deposited" },
  withdraw: { icon: ArrowUpRight, color: "text-orange-400", bg: "bg-orange-500/20", label: "Withdrawn" }
};

const statusConfig = {
  completed: { icon: CheckCircle2, color: "text-emerald-400" },
  pending: { icon: Clock, color: "text-yellow-400" },
  failed: { icon: XCircle, color: "text-red-400" },
  cancelled: { icon: XCircle, color: "text-slate-400" }
};

export default function RecentTransactions({ transactions }) {
  const recentTransactions = transactions?.slice(0, 5) || [];

  if (recentTransactions.length === 0) {
    return (
      <Card className="border-0 bg-slate-900/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-200">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-slate-500" />
            </div>
            <p className="text-slate-400 text-sm">No transactions yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-slate-900/50 backdrop-blur-xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold text-slate-200">Recent Activity</CardTitle>
        <Link to={createPageUrl("Transactions")}>
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200">
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-2">
        {recentTransactions.map((tx, index) => {
          const config = typeConfig[tx.type] || typeConfig.buy;
          const status = statusConfig[tx.status] || statusConfig.completed;
          const Icon = config.icon;
          const StatusIcon = status.icon;

          return (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${config.bg}`}>
                    <Icon className={`w-4 h-4 ${config.color}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-200 text-sm">{config.label}</span>
                      {tx.asset && (
                        <Badge variant="secondary" className="bg-slate-700 text-slate-300 text-xs">
                          {tx.asset}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      {format(new Date(tx.created_date), "MMM d, h:mm a")}
                    </p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-2">
                  <div>
                    <p className={`font-semibold text-sm ${tx.type === 'buy' || tx.type === 'receive' || tx.type === 'deposit' ? 'text-emerald-400' : 'text-slate-200'}`}>
                      {tx.type === 'buy' || tx.type === 'receive' || tx.type === 'deposit' ? '+' : '-'}${tx.total_value?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    {tx.amount && tx.asset && (
                      <p className="text-xs text-slate-500">{tx.amount} {tx.asset}</p>
                    )}
                  </div>
                  <StatusIcon className={`w-4 h-4 ${status.color}`} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}