import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownLeft, Send, QrCode } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function QuickActions() {
  const actions = [
    {
      label: "Buy",
      icon: ArrowDownLeft,
      href: createPageUrl("Trade") + "?action=buy",
      color: "bg-emerald-500 hover:bg-emerald-600",
      iconBg: "bg-emerald-600"
    },
    {
      label: "Sell",
      icon: ArrowUpRight,
      href: createPageUrl("Trade") + "?action=sell",
      color: "bg-red-500 hover:bg-red-600",
      iconBg: "bg-red-600"
    },
    {
      label: "Send",
      icon: Send,
      href: createPageUrl("Payments") + "?action=send",
      color: "bg-blue-500 hover:bg-blue-600",
      iconBg: "bg-blue-600"
    },
    {
      label: "Request",
      icon: QrCode,
      href: createPageUrl("Payments") + "?action=request",
      color: "bg-violet-500 hover:bg-violet-600",
      iconBg: "bg-violet-600"
    }
  ];

  return (
    <Card className="border-0 bg-slate-900/50 backdrop-blur-xl p-4">
      <div className="grid grid-cols-4 gap-3">
        {actions.map((action, index) => (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link to={action.href}>
              <Button
                className={`w-full h-auto flex flex-col items-center gap-2 py-4 ${action.color} border-0 transition-all hover:scale-105`}
              >
                <div className={`p-2 rounded-lg ${action.iconBg}`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium">{action.label}</span>
              </Button>
            </Link>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}