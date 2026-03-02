import { useState, useEffect } from "react";
import { Rss, Circle } from "lucide-react";

const HEADLINES = [
  { id: 1, time: "09:42", tag: "MKTS", headline: "Federal Reserve signals potential rate cuts in H2 as inflation cools to 2.8%", impact: "positive", tickers: ["SPX", "TLT"] },
  { id: 2, time: "09:38", tag: "TECH", headline: "NVIDIA beats Q4 estimates; data center revenue surges 265% YoY on AI demand", impact: "positive", tickers: ["NVDA", "AMD"] },
  { id: 3, time: "09:31", tag: "CRYPT", headline: "Bitcoin ETF inflows hit record $1.2B in single day as institutional adoption accelerates", impact: "positive", tickers: ["BTC", "ETH"] },
  { id: 4, time: "09:24", tag: "MACRO", headline: "US jobless claims rise to 218K, slightly above consensus of 215K", impact: "neutral", tickers: ["SPX", "DXY"] },
  { id: 5, time: "09:15", tag: "ENRGY", headline: "OPEC+ confirms extension of production cuts through Q3, oil rises 1.2%", impact: "positive", tickers: ["OIL", "XOM"] },
  { id: 6, time: "08:57", tag: "TECH", headline: "Apple Vision Pro 2 reportedly in development with advanced eye-tracking AI features", impact: "positive", tickers: ["AAPL"] },
  { id: 7, time: "08:44", tag: "MKTS", headline: "European markets open lower on PMI data miss; DAX off 0.4%", impact: "negative", tickers: ["EWG", "EUR/USD"] },
  { id: 8, time: "08:32", tag: "FX", headline: "Dollar index weakens to 103.2 ahead of key non-farm payroll data Friday", impact: "neutral", tickers: ["DXY", "EUR/USD", "GBP/USD"] },
  { id: 9, time: "08:18", tag: "EARN", headline: "Tesla misses Q4 delivery estimates; shares drop pre-market on margin concerns", impact: "negative", tickers: ["TSLA"] },
  { id: 10, time: "08:05", tag: "M&A", headline: "Microsoft in advanced talks to acquire cybersecurity firm for $8.5B — WSJ", impact: "positive", tickers: ["MSFT", "PANW"] },
  { id: 11, time: "07:52", tag: "BOND", headline: "10-year Treasury yield climbs to 4.38% amid strong economic data", impact: "negative", tickers: ["TLT", "SPX"] },
  { id: 12, time: "07:41", tag: "CRYPT", headline: "Ethereum developers confirm next upgrade scheduled for April, adding new EVM features", impact: "positive", tickers: ["ETH"] },
  { id: 13, time: "07:28", tag: "MACRO", headline: "China manufacturing PMI contracts for third consecutive month at 49.1", impact: "negative", tickers: ["FXI", "SPX"] },
  { id: 14, time: "07:14", tag: "TECH", headline: "Google announces 10% workforce reduction in cloud division; stock up pre-market", impact: "neutral", tickers: ["GOOGL"] },
  { id: 15, time: "07:02", tag: "IPO", headline: "Reddit priced IPO at $34/share, valuing social platform at $6.5B", impact: "positive", tickers: ["RDDT"] },
  { id: 16, time: "06:48", tag: "MKTS", headline: "Asian markets mixed; Nikkei +0.8% on yen weakness, Shanghai Composite -0.3%", impact: "neutral", tickers: ["EWJ", "FXI"] },
  { id: 17, time: "06:35", tag: "COMM", headline: "Meta launches new AI-powered ad targeting tools, analysts raise price targets", impact: "positive", tickers: ["META"] },
  { id: 18, time: "06:21", tag: "BOND", headline: "ECB holds rates steady, Lagarde signals cautious approach to easing cycle", impact: "neutral", tickers: ["EUR/USD", "EWG"] },
];

const tagColors = {
  MKTS: "#3a7aff", TECH: "#a78bfa", CRYPT: "#f59e0b", MACRO: "#6b7280",
  ENRGY: "#f97316", FX: "#06b6d4", EARN: "#10b981", "M&A": "#ec4899",
  BOND: "#8b5cf6", IPO: "#22c55e", COMM: "#14b8a6",
};

const impactColors = { positive: "#00d084", negative: "#ff4444", neutral: "#6b7280" };

export default function NewsPanel() {
  const [headlines, setHeadlines] = useState(HEADLINES);
  const [selected, setSelected] = useState(null);
  const [flash, setFlash] = useState(null);

  // Simulate new headlines coming in
  useEffect(() => {
    const EXTRA = [
      { tag: "MKTS", headline: "S&P 500 futures extend gains, tracking positive global sentiment", impact: "positive", tickers: ["SPX"] },
      { tag: "TECH", headline: "Semiconductor index hits all-time high on AI chip demand outlook", impact: "positive", tickers: ["SOXX", "NVDA"] },
      { tag: "CRYPT", headline: "Coinbase reports record trading volumes in Q1 2026", impact: "positive", tickers: ["BTC", "ETH"] },
      { tag: "MACRO", headline: "US consumer confidence falls to 3-month low on higher gasoline prices", impact: "negative", tickers: ["SPX"] },
    ];
    let idx = 0;
    const id = setInterval(() => {
      const now = new Date();
      const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
      const newItem = { ...EXTRA[idx % EXTRA.length], id: Date.now(), time };
      setHeadlines(prev => [newItem, ...prev.slice(0, 24)]);
      setFlash(newItem.id);
      setTimeout(() => setFlash(null), 1200);
      idx++;
    }, 12000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col h-full" style={{ background: "#0d1117" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: "#1a2a1a", background: "#0a0c0d" }}>
        <div className="flex items-center gap-2">
          <Rss className="w-3.5 h-3.5" style={{ color: "#ff6600" }} />
          <span className="text-xs font-bold font-mono uppercase tracking-widest" style={{ color: "#ff6600" }}>News Feed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Circle className="w-1.5 h-1.5 fill-current animate-pulse" style={{ color: "#00d084" }} />
          <span className="text-[9px] font-mono" style={{ color: "#4a6a4a" }}>LIVE</span>
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto">
        {headlines.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelected(selected?.id === item.id ? null : item)}
            className="cursor-pointer border-b transition-all"
            style={{
              borderColor: "#0f1a0f",
              background: flash === item.id ? "#0f2a0a" : selected?.id === item.id ? "#0f1f0f" : "transparent",
            }}
            onMouseEnter={e => selected?.id !== item.id && (e.currentTarget.style.background = "#0a1a0a")}
            onMouseLeave={e => selected?.id !== item.id && (e.currentTarget.style.background = "transparent")}
          >
            <div className="flex items-start gap-2 px-3 py-2">
              <div className="flex flex-col items-center gap-1 pt-0.5 shrink-0">
                <span className="text-[9px] font-mono" style={{ color: "#3a5a3a" }}>{item.time}</span>
                <div className="w-1 h-1 rounded-full mt-0.5" style={{ background: impactColors[item.impact] }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm font-mono" style={{ background: (tagColors[item.tag] || "#3a5a3a") + "25", color: tagColors[item.tag] || "#6a8a6a" }}>
                    {item.tag}
                  </span>
                  <div className="flex gap-1">
                    {item.tickers.slice(0, 3).map(t => (
                      <span key={t} className="text-[9px] font-mono" style={{ color: "#ff6600" }}>{t}</span>
                    ))}
                  </div>
                </div>
                <p className="text-xs leading-snug" style={{ color: "#a8b8a8", lineHeight: 1.4 }}>{item.headline}</p>
              </div>
            </div>

            {selected?.id === item.id && (
              <div className="px-3 pb-3 pt-1">
                <div className="rounded p-2.5 text-xs" style={{ background: "#0a1a0a", border: "1px solid #1a2a1a" }}>
                  <p style={{ color: "#7a9a7a" }} className="leading-relaxed">
                    Full article preview — market participants are closely watching developments around {item.tickers[0]}{item.tickers.length > 1 ? ` and ${item.tickers.slice(1).join(', ')}` : ''}. Analysts suggest this could have a {item.impact} short-term impact on related securities.
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    {item.tickers.map(t => (
                      <span key={t} className="font-mono text-[10px] px-2 py-0.5 rounded" style={{ background: "#1a2a1a", color: "#ff6600" }}>{t}</span>
                    ))}
                    <span className="ml-auto text-[10px]" style={{ color: impactColors[item.impact] }}>● {item.impact.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}