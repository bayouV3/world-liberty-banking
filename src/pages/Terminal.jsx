import { useState, useEffect } from "react";
import { Monitor, LayoutGrid, Maximize2, RefreshCw, Clock, Wifi } from "lucide-react";
import TickerTape from "@/components/terminal/TickerTape";
import MarketPanel from "@/components/terminal/MarketPanel";
import NewsPanel from "@/components/terminal/NewsPanel";
import OrderBookPanel from "@/components/terminal/OrderBookPanel";
import MacroPanel from "@/components/terminal/MacroPanel";

const PANEL_CONFIGS = {
  "4-panel": [
    { id: "market", label: "Market Watch", component: "market", col: "col-span-1", row: "row-span-2" },
    { id: "news", label: "News Feed", component: "news", col: "col-span-1", row: "row-span-2" },
    { id: "orderbook", label: "Order Book", component: "orderbook", col: "col-span-1", row: "row-span-1" },
    { id: "macro", label: "Macro", component: "macro", col: "col-span-1", row: "row-span-1" },
  ],
  "2-panel": [
    { id: "market", label: "Market Watch", component: "market" },
    { id: "news", label: "News Feed", component: "news" },
  ],
  "market-focus": [
    { id: "market", label: "Market Watch", component: "market" },
    { id: "orderbook", label: "Order Book", component: "orderbook" },
    { id: "macro", label: "Macro", component: "macro" },
  ],
};

const LAYOUTS = [
  { id: "4-panel", label: "4 Panel", icon: LayoutGrid },
  { id: "2-panel", label: "2 Panel", icon: Monitor },
  { id: "market-focus", label: "Market Focus", icon: Maximize2 },
];

function PanelComponent({ id }) {
  if (id === "market") return <MarketPanel />;
  if (id === "news") return <NewsPanel />;
  if (id === "orderbook") return <OrderBookPanel />;
  if (id === "macro") return <MacroPanel />;
  return null;
}

function PanelHeader({ label }) {
  return (
    <div className="flex items-center justify-between px-3 py-1.5 shrink-0" style={{ background: "#080e08", borderBottom: "1px solid #1a2a1a" }}>
      <span className="text-[9px] font-mono font-bold uppercase tracking-widest" style={{ color: "#3a6a3a" }}>{label}</span>
      <div className="flex gap-2">
        <div className="w-2 h-2 rounded-full" style={{ background: "#ff4444", opacity: 0.6 }} />
        <div className="w-2 h-2 rounded-full" style={{ background: "#ffaa00", opacity: 0.6 }} />
        <div className="w-2 h-2 rounded-full" style={{ background: "#00d084", opacity: 0.6 }} />
      </div>
    </div>
  );
}

export default function Terminal() {
  const [layout, setLayout] = useState("4-panel");
  const [time, setTime] = useState(new Date());
  const [marketStatus, setMarketStatus] = useState("OPEN");

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Determine market status
  useEffect(() => {
    const h = time.getHours();
    const day = time.getDay();
    const isWeekend = day === 0 || day === 6;
    if (isWeekend || h < 9 || h >= 16) setMarketStatus("CLOSED");
    else if (h === 9 && time.getMinutes() < 30) setMarketStatus("PRE");
    else if (h >= 16) setMarketStatus("AH");
    else setMarketStatus("OPEN");
  }, [time]);

  const statusColor = { OPEN: "#00d084", CLOSED: "#ff4444", PRE: "#f59e0b", AH: "#3a7aff" }[marketStatus];

  const panels = PANEL_CONFIGS[layout];

  return (
    <div className="flex flex-col" style={{ background: "#080e08", minHeight: "100vh", fontFamily: "'Courier New', monospace" }}>

      {/* Terminal Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 shrink-0" style={{ background: "#040804", borderBottom: "1px solid #1a2a1a" }}>
        {/* Left: Branding */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4" style={{ color: "#ff6600" }} />
            <span className="text-sm font-bold font-mono" style={{ color: "#ff6600" }}>WORLDFI</span>
            <span className="text-xs font-mono" style={{ color: "#3a5a3a" }}>TERMINAL</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded" style={{ background: "#0a1a0a", border: "1px solid #1a3a1a" }}>
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: statusColor }} />
            <span className="text-[10px] font-mono font-bold" style={{ color: statusColor }}>NYSE: {marketStatus}</span>
          </div>
        </div>

        {/* Center: Layout switcher */}
        <div className="hidden md:flex items-center gap-1">
          {LAYOUTS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setLayout(id)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono uppercase tracking-wider transition-all"
              style={{
                background: layout === id ? "#1a3a1a" : "transparent",
                color: layout === id ? "#00d084" : "#3a5a3a",
                border: `1px solid ${layout === id ? "#2a5a2a" : "transparent"}`
              }}>
              <Icon className="w-3 h-3" />{label}
            </button>
          ))}
        </div>

        {/* Right: Clock / status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Wifi className="w-3 h-3" style={{ color: "#2a5a2a" }} />
            <span className="text-[9px] font-mono" style={{ color: "#2a5a2a" }}>LIVE</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3" style={{ color: "#3a5a3a" }} />
            <span className="text-xs font-mono tabular-nums" style={{ color: "#6a9a6a" }}>
              {time.toLocaleTimeString('en-US', { hour12: false })} UTC
            </span>
          </div>
          <div className="text-[10px] font-mono" style={{ color: "#3a5a3a" }}>
            {time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Ticker Tape */}
      <TickerTape />

      {/* Panel Grid */}
      <div className={`flex-1 grid overflow-hidden ${
        layout === "4-panel" ? "grid-cols-2 grid-rows-2" :
        layout === "2-panel" ? "grid-cols-2 grid-rows-1" :
        "grid-cols-3 grid-rows-1"
      }`}
        style={{ height: "calc(100vh - 96px)" }}>

        {panels.map(panel => (
          <div key={panel.id} className={`flex flex-col overflow-hidden border-r border-b ${panel.col || ""} ${panel.row || ""}`}
            style={{ borderColor: "#1a2a1a" }}>
            <PanelHeader label={panel.label} />
            <div className="flex-1 overflow-hidden">
              <PanelComponent id={panel.component} />
            </div>
          </div>
        ))}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-1 shrink-0" style={{ background: "#040804", borderTop: "1px solid #1a2a1a" }}>
        <div className="flex items-center gap-4">
          <span className="text-[9px] font-mono" style={{ color: "#2a4a2a" }}>WF-TERMINAL v2.1.0</span>
          <span className="text-[9px] font-mono" style={{ color: "#2a4a2a" }}>DATA: SIMULATED · DELAYED 15MIN</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#00d084" }} />
          <span className="text-[9px] font-mono" style={{ color: "#2a5a2a" }}>ALL SYSTEMS NOMINAL</span>
        </div>
      </div>
    </div>
  );
}