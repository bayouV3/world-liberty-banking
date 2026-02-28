import { useAssetPrices } from "@/components/trading/useAssetPrices";
import { TrendingUp, TrendingDown } from "lucide-react";

const COIN_COLORS = {
  BTC: { color: "#f7931a", bg: "rgba(247,147,26,0.12)", label: "₿" },
  ETH: { color: "#627eea", bg: "rgba(98,126,234,0.12)", label: "Ξ" },
  SOL: { color: "#9945ff", bg: "rgba(153,69,255,0.12)", label: "◎" },
  BNB: { color: "#f3ba2f", bg: "rgba(243,186,47,0.12)", label: "⬡" },
  ADA: { color: "#0088ff", bg: "rgba(0,136,255,0.12)", label: "₳" },
  DOGE: { color: "#c2a633", bg: "rgba(194,166,51,0.12)", label: "Ð" },
  XRP: { color: "#00aae4", bg: "rgba(0,170,228,0.12)", label: "✕" },
};

const DEFAULT_COLOR = { color: "#818cf8", bg: "rgba(129,140,248,0.12)", label: "◈" };

export default function CoinBalanceWidgets({ positions }) {
  // Filter only crypto-like holdings (symbols present in COIN_COLORS or short symbols)
  const cryptoPositions = positions?.filter(p =>
    COIN_COLORS[p.symbol] || p.symbol?.length <= 5
  ) ?? [];

  const symbols = cryptoPositions.map(p => p.symbol);
  const { prices } = useAssetPrices(symbols);

  if (!cryptoPositions.length) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-white font-bold text-base">My Coins</h2>
        <span className="text-xs text-slate-500">{cryptoPositions.length} assets</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {cryptoPositions.map(pos => {
          const meta = COIN_COLORS[pos.symbol] || DEFAULT_COLOR;
          const livePrice = prices[pos.symbol] || pos.current_price || pos.avg_cost;
          const value = pos.quantity * livePrice;
          const pl = value - pos.quantity * pos.avg_cost;
          const plPct = pos.avg_cost > 0 ? (pl / (pos.quantity * pos.avg_cost)) * 100 : 0;
          const isUp = pl >= 0;

          return (
            <div key={pos.id}
              className="rounded-2xl p-4 flex flex-col gap-2 transition-all hover:scale-[1.02]"
              style={{ background: "#111118", border: "1px solid #1e2030" }}>
              {/* Icon + symbol */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold"
                  style={{ background: meta.bg, color: meta.color }}>
                  {meta.label}
                </div>
                <div>
                  <p className="text-white text-xs font-bold leading-tight">{pos.symbol}</p>
                  <p className="text-slate-600 text-[10px]">{pos.name || pos.symbol}</p>
                </div>
              </div>

              {/* Value */}
              <div>
                <p className="text-white font-bold text-sm">
                  ${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
                <p className="text-slate-500 text-[11px]">
                  {pos.quantity} {pos.symbol}
                </p>
              </div>

              {/* P&L */}
              <div className={`flex items-center gap-1 text-[11px] font-semibold ${isUp ? "text-emerald-400" : "text-rose-400"}`}>
                {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {isUp ? "+" : ""}{plPct.toFixed(2)}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}