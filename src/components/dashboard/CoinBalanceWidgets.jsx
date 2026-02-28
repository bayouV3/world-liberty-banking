import { useAssetPrices } from "@/components/trading/useAssetPrices";
import { TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

const COIN_META = {
  BTC:  { color: "#f7931a", bg: "rgba(247,147,26,0.12)" },
  ETH:  { color: "#627eea", bg: "rgba(98,126,234,0.12)" },
  SOL:  { color: "#9945ff", bg: "rgba(153,69,255,0.12)" },
  BNB:  { color: "#f3ba2f", bg: "rgba(243,186,47,0.12)" },
  ADA:  { color: "#0088ff", bg: "rgba(0,136,255,0.12)" },
  DOGE: { color: "#c2a633", bg: "rgba(194,166,51,0.12)" },
  XRP:  { color: "#00aae4", bg: "rgba(0,170,228,0.12)" },
  AAPL: { color: "#a8a8a8", bg: "rgba(168,168,168,0.12)" },
  GOOGL:{ color: "#4285f4", bg: "rgba(66,133,244,0.12)" },
  MSFT: { color: "#00a4ef", bg: "rgba(0,164,239,0.12)" },
  TSLA: { color: "#e31937", bg: "rgba(227,25,55,0.12)" },
  AMZN: { color: "#ff9900", bg: "rgba(255,153,0,0.12)" },
};

const DEFAULT_META = { color: "#818cf8", bg: "rgba(129,140,248,0.12)" };

function CoinIcon({ symbol, color, bg }) {
  const imgUrl = `https://assets.coincap.io/assets/icons/${symbol.toLowerCase()}@2x.png`;
  return (
    <motion.div
      className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold overflow-hidden"
      style={{ background: bg }}
      animate={{ rotate: [0, 2, -2, 0] }}
      transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
    >
      <img
        src={imgUrl}
        alt={symbol}
        className="w-6 h-6 object-contain"
        onError={e => {
          e.target.style.display = "none";
          e.target.nextSibling.style.display = "flex";
        }}
      />
      <span style={{ color, display: "none" }} className="text-xs font-black">{symbol.slice(0,2)}</span>
    </motion.div>
  );
}

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
        {cryptoPositions.map((pos, i) => {
          const meta = COIN_META[pos.symbol] || DEFAULT_META;
          const livePrice = prices[pos.symbol] || pos.current_price || pos.avg_cost;
          const value = pos.quantity * livePrice;
          const pl = value - pos.quantity * pos.avg_cost;
          const plPct = pos.avg_cost > 0 ? (pl / (pos.quantity * pos.avg_cost)) * 100 : 0;
          const isUp = pl >= 0;

          return (
            <motion.div
              key={pos.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.35 }}
              whileHover={{ scale: 1.03, transition: { duration: 0.15 } }}
              className="rounded-2xl p-4 flex flex-col gap-2 cursor-default"
              style={{ background: "#111118", border: `1px solid ${meta.color}22` }}>

              {/* Icon + symbol */}
              <div className="flex items-center gap-2">
                <CoinIcon symbol={pos.symbol} color={meta.color} bg={meta.bg} />
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
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}