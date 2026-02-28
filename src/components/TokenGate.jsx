import { Lock, Wallet, CheckCircle2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * TOKEN GATE CONFIG
 * Define which features require which tokens and minimum quantities.
 */
export const TOKEN_GATES = {
  premium_analytics: {
    label: "Premium Analytics",
    description: "Advanced portfolio stats and trading insights",
    required_token: "WFI",        // WorldFi token
    min_quantity: 1000,
    icon: TrendingUp,
    color: "blue",
  },
  etf_portfolios: {
    label: "ETF Portfolios",
    description: "Create and manage custom ETF-style portfolios",
    required_token: "WFI",
    min_quantity: 5000,
    icon: TrendingUp,
    color: "violet",
  },
};

/**
 * Check if a TokenHolder record satisfies a gate.
 * We match by favorite_token OR simply check tokens_held >= min_quantity
 * (treating all holdings as WFI for demo purposes).
 */
export function checkAccess(gate, tokenHolder) {
  if (!tokenHolder) return false;
  return (tokenHolder.tokens_held ?? 0) >= gate.min_quantity;
}

const colorMap = {
  blue: {
    border: "border-blue-500/30",
    bg: "bg-blue-500/10",
    icon: "text-blue-400",
    btn: "bg-blue-600 hover:bg-blue-500",
    badge: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  },
  violet: {
    border: "border-violet-500/30",
    bg: "bg-violet-500/10",
    icon: "text-violet-400",
    btn: "bg-violet-600 hover:bg-violet-500",
    badge: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  },
};

export default function TokenGate({ gateKey, tokenHolder, onConnectWallet, children }) {
  const gate = TOKEN_GATES[gateKey];
  const hasAccess = checkAccess(gate, tokenHolder);
  const c = colorMap[gate.color] ?? colorMap.blue;

  if (hasAccess) return children;

  return (
    <div className={`rounded-2xl border ${c.border} ${c.bg} p-8 flex flex-col items-center text-center gap-4`}>
      <div className={`p-4 rounded-2xl ${c.bg} border ${c.border}`}>
        <Lock className={`w-8 h-8 ${c.icon}`} />
      </div>
      <div>
        <h3 className="text-white font-bold text-xl mb-1">{gate.label} — Members Only</h3>
        <p className="text-slate-400 text-sm max-w-xs mx-auto">{gate.description}</p>
      </div>
      <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${c.badge} text-sm font-medium`}>
        <CheckCircle2 className="w-4 h-4" />
        Requires {gate.min_quantity.toLocaleString()}+ {gate.required_token} tokens
      </div>
      {!tokenHolder ? (
        <Button onClick={onConnectWallet} className={`${c.btn} text-white gap-2`}>
          <Wallet className="w-4 h-4" />
          Connect Wallet to Verify
        </Button>
      ) : (
        <div className="text-slate-500 text-sm">
          Your wallet holds <span className="text-white font-semibold">{tokenHolder.tokens_held?.toLocaleString()}</span> tokens — need {gate.min_quantity.toLocaleString()}
        </div>
      )}
    </div>
  );
}