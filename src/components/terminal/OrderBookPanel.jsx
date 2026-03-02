import { useState, useEffect } from "react";

function generateBook(price) {
  const asks = [];
  const bids = [];
  for (let i = 0; i < 12; i++) {
    asks.push({ price: parseFloat((price + (i + 1) * price * 0.0003).toFixed(2)), size: parseFloat((Math.random() * 50 + 5).toFixed(2)), total: 0 });
    bids.push({ price: parseFloat((price - (i + 1) * price * 0.0003).toFixed(2)), size: parseFloat((Math.random() * 50 + 5).toFixed(2)), total: 0 });
  }
  let t = 0;
  asks.forEach(a => { t += a.size; a.total = parseFloat(t.toFixed(2)); });
  t = 0;
  bids.forEach(b => { t += b.size; b.total = parseFloat(t.toFixed(2)); });
  const maxTotal = Math.max(asks[asks.length - 1]?.total || 1, bids[bids.length - 1]?.total || 1);
  return { asks: asks.reverse(), bids, maxTotal, spread: parseFloat((asks[0]?.price - bids[0]?.price || 0).toFixed(2)), midPrice: price };
}

const SYMBOL_PRICES = {
  AAPL: 178.42, MSFT: 415.20, NVDA: 875.64, GOOGL: 164.32, TSLA: 242.11,
  AMZN: 192.45, META: 527.80, BTC: 67234.50, ETH: 3512.80,
};

export default function OrderBookPanel() {
  const [symbol, setSymbol] = useState("AAPL");
  const [book, setBook] = useState(() => generateBook(SYMBOL_PRICES["AAPL"]));

  useEffect(() => {
    setBook(generateBook(SYMBOL_PRICES[symbol] || 100));
  }, [symbol]);

  useEffect(() => {
    const id = setInterval(() => {
      const base = SYMBOL_PRICES[symbol] || 100;
      setBook(generateBook(base * (1 + (Math.random() - 0.5) * 0.001)));
    }, 1500);
    return () => clearInterval(id);
  }, [symbol]);

  const { asks, bids, maxTotal, spread, midPrice } = book;
  const spreadPct = ((spread / midPrice) * 100).toFixed(4);

  return (
    <div className="flex flex-col h-full" style={{ background: "#0d1117" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: "#1a2a1a", background: "#0a0c0d" }}>
        <span className="text-xs font-bold font-mono uppercase tracking-widest" style={{ color: "#ff6600" }}>Order Book</span>
        <select
          value={symbol}
          onChange={e => setSymbol(e.target.value)}
          className="text-xs font-mono rounded px-2 py-0.5 outline-none cursor-pointer"
          style={{ background: "#1a2a1a", color: "#c8d0c8", border: "1px solid #2a3a2a" }}>
          {Object.keys(SYMBOL_PRICES).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Column headers */}
        <div className="grid grid-cols-3 px-3 py-1 text-[9px] font-mono font-semibold uppercase tracking-widest" style={{ color: "#3a5a3a", borderBottom: "1px solid #0f1a0f" }}>
          <span>Price</span>
          <span className="text-right">Size</span>
          <span className="text-right">Total</span>
        </div>

        {/* Asks (sell orders) */}
        <div className="overflow-hidden" style={{ maxHeight: "45%" }}>
          {asks.map((row, i) => (
            <div key={i} className="relative grid grid-cols-3 px-3 py-0.5 font-mono text-[11px]"
              style={{ borderBottom: "1px solid #0a0f0a" }}>
              <div className="absolute inset-y-0 right-0 opacity-20"
                style={{ width: `${(row.total / maxTotal) * 100}%`, background: "#ff4444" }} />
              <span className="relative z-10" style={{ color: "#ff4444" }}>
                {row.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span className="relative z-10 text-right" style={{ color: "#8a9a8a" }}>{row.size.toFixed(2)}</span>
              <span className="relative z-10 text-right" style={{ color: "#4a6a4a" }}>{row.total.toFixed(2)}</span>
            </div>
          ))}
        </div>

        {/* Spread */}
        <div className="flex items-center justify-between px-3 py-1.5 font-mono text-[10px]"
          style={{ background: "#0a1a0a", borderTop: "1px solid #1a2a1a", borderBottom: "1px solid #1a2a1a" }}>
          <span style={{ color: "#3a5a3a" }}>SPREAD</span>
          <span style={{ color: "#c8d0c8" }}>{spread.toFixed(2)}</span>
          <span style={{ color: "#4a7a4a" }}>{spreadPct}%</span>
          <span style={{ color: "#ff6600", fontWeight: "bold" }}>
            {midPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* Bids (buy orders) */}
        <div className="overflow-hidden" style={{ maxHeight: "45%" }}>
          {bids.map((row, i) => (
            <div key={i} className="relative grid grid-cols-3 px-3 py-0.5 font-mono text-[11px]"
              style={{ borderBottom: "1px solid #0a0f0a" }}>
              <div className="absolute inset-y-0 right-0 opacity-20"
                style={{ width: `${(row.total / maxTotal) * 100}%`, background: "#00d084" }} />
              <span className="relative z-10" style={{ color: "#00d084" }}>
                {row.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span className="relative z-10 text-right" style={{ color: "#8a9a8a" }}>{row.size.toFixed(2)}</span>
              <span className="relative z-10 text-right" style={{ color: "#4a6a4a" }}>{row.total.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}