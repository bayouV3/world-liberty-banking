import { useEffect, useState, useRef } from "react";

const BASE_TICKERS = [
  { symbol: "SPX", name: "S&P 500", price: 5234.18, change: 0.42 },
  { symbol: "NDX", name: "Nasdaq 100", price: 18421.32, change: 1.12 },
  { symbol: "DJI", name: "Dow Jones", price: 38891.54, change: -0.18 },
  { symbol: "BTC", name: "Bitcoin", price: 67234.50, change: 2.87 },
  { symbol: "ETH", name: "Ethereum", price: 3512.80, change: 1.54 },
  { symbol: "AAPL", name: "Apple", price: 178.42, change: 0.83 },
  { symbol: "MSFT", name: "Microsoft", price: 415.20, change: 0.62 },
  { symbol: "NVDA", name: "NVIDIA", price: 875.64, change: 3.21 },
  { symbol: "GOOGL", name: "Alphabet", price: 164.32, change: -0.34 },
  { symbol: "TSLA", name: "Tesla", price: 242.11, change: -1.87 },
  { symbol: "AMZN", name: "Amazon", price: 192.45, change: 0.95 },
  { symbol: "META", name: "Meta", price: 527.80, change: 1.42 },
  { symbol: "GLD", name: "Gold", price: 2312.40, change: 0.28 },
  { symbol: "OIL", name: "Crude Oil", price: 78.32, change: -0.67 },
  { symbol: "VIX", name: "Volatility", price: 14.82, change: -3.21 },
  { symbol: "EUR/USD", name: "Euro/Dollar", price: 1.0842, change: 0.12 },
  { symbol: "GBP/USD", name: "Cable", price: 1.2634, change: -0.08 },
];

export default function TickerTape() {
  const [tickers, setTickers] = useState(BASE_TICKERS);
  const animRef = useRef(null);

  // Simulate live price fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      setTickers(prev => prev.map(t => {
        const delta = (Math.random() - 0.5) * 0.4;
        const newChange = parseFloat((t.change + delta * 0.1).toFixed(2));
        const newPrice = parseFloat((t.price * (1 + delta * 0.001)).toFixed(2));
        return { ...t, price: newPrice, change: newChange };
      }));
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const doubled = [...tickers, ...tickers];

  return (
    <div className="overflow-hidden border-b select-none" style={{ background: "#0a0c0d", borderColor: "#1a2a1a", height: 32 }}>
      <div className="flex items-center h-full animate-marquee whitespace-nowrap" style={{ animationDuration: "60s" }}>
        {doubled.map((t, i) => {
          const up = t.change >= 0;
          return (
            <span key={i} className="inline-flex items-center gap-1.5 px-4 text-xs font-mono border-r" style={{ borderColor: "#1a2a1a" }}>
              <span className="font-bold text-[#ff6600]">{t.symbol}</span>
              <span style={{ color: "#c8d0d8" }}>{t.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span style={{ color: up ? "#00d084" : "#ff4444", fontSize: 10 }}>
                {up ? "▲" : "▼"} {Math.abs(t.change).toFixed(2)}%
              </span>
            </span>
          );
        })}
      </div>
      <style>{`
        @keyframes marquee { 0% { transform: translateX(0) } 100% { transform: translateX(-50%) } }
        .animate-marquee { animation: marquee linear infinite; }
      `}</style>
    </div>
  );
}