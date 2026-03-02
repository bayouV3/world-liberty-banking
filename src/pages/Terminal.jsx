import { useState, useEffect, useCallback } from "react";
import { Monitor, Clock, Wifi } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import TickerTape from "@/components/terminal/TickerTape";
import MarketPanel from "@/components/terminal/MarketPanel";
import NewsPanel from "@/components/terminal/NewsPanel";
import OrderBookPanel from "@/components/terminal/OrderBookPanel";
import MacroPanel from "@/components/terminal/MacroPanel";
import { PanelHeader } from "@/components/terminal/PanelWrapper";
import LayoutControls from "@/components/terminal/LayoutControls";

const ALL_PANELS = [
  { id: "market", label: "Market Watch" },
  { id: "news", label: "News Feed" },
  { id: "orderbook", label: "Order Book" },
  { id: "macro", label: "Macro" },
];

const DEFAULT_ORDERS = {
  "4-panel": ["market", "news", "orderbook", "macro"],
  "2-panel": ["market", "news"],
  "market-focus": ["market", "orderbook", "macro"],
};

const GRID_CLASSES = {
  "4-panel": "grid-cols-2 grid-rows-2",
  "2-panel": "grid-cols-2 grid-rows-1",
  "market-focus": "grid-cols-3 grid-rows-1",
};

const LS_KEY = "wf_terminal_layout";

function PanelComponent({ id }) {
  if (id === "market") return <MarketPanel />;
  if (id === "news") return <NewsPanel />;
  if (id === "orderbook") return <OrderBookPanel />;
  if (id === "macro") return <MacroPanel />;
  return null;
}

function loadSaved() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveToDisk(preset, orders) {
  localStorage.setItem(LS_KEY, JSON.stringify({ preset, orders }));
}

function clearDisk() {
  localStorage.removeItem(LS_KEY);
}

export default function Terminal() {
  const saved = loadSaved();
  const [preset, setPreset] = useState(saved?.preset || "4-panel");
  const [orders, setOrders] = useState(saved?.orders || { ...DEFAULT_ORDERS });
  const [hasSaved, setHasSaved] = useState(!!saved);
  const [time, setTime] = useState(new Date());
  const [marketStatus, setMarketStatus] = useState("OPEN");
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

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

  const panelOrder = orders[preset] || DEFAULT_ORDERS[preset];

  const handleDragEnd = useCallback((result) => {
    setDragging(false);
    if (!result.destination) return;
    const { source, destination } = result;
    if (source.index === destination.index) return;

    const newOrder = [...panelOrder];
    const [moved] = newOrder.splice(source.index, 1);
    newOrder.splice(destination.index, 0, moved);
    setOrders(prev => ({ ...prev, [preset]: newOrder }));
  }, [panelOrder, preset]);

  const handlePresetChange = (id) => {
    setPreset(id);
  };

  const handleSave = () => {
    saveToDisk(preset, orders);
    setHasSaved(true);
  };

  const handleReset = () => {
    clearDisk();
    setOrders({ ...DEFAULT_ORDERS });
    setPreset("4-panel");
    setHasSaved(false);
  };

  return (
    <div className="flex flex-col" style={{ background: "#080e08", minHeight: "100vh", fontFamily: "'Courier New', monospace" }}>

      {/* Terminal Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 shrink-0" style={{ background: "#040804", borderBottom: "1px solid #1a2a1a" }}>
        {/* Branding */}
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

        {/* Layout controls */}
        <LayoutControls
          currentPreset={preset}
          onPresetChange={handlePresetChange}
          onSave={handleSave}
          onReset={handleReset}
          hasSaved={hasSaved}
        />

        {/* Clock / status */}
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
          <div className="text-[10px] font-mono hidden md:block" style={{ color: "#3a5a3a" }}>
            {time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Ticker Tape */}
      <TickerTape />

      {/* Drag hint */}
      {hasSaved && (
        <div className="px-4 py-0.5 flex items-center gap-2 shrink-0" style={{ background: "#050d05", borderBottom: "1px solid #0e1e0e" }}>
          <span className="text-[9px] font-mono" style={{ color: "#2a5a2a" }}>
            CUSTOM LAYOUT ACTIVE · Drag panel headers to rearrange · Drag panel edges to resize
          </span>
        </div>
      )}
      {!hasSaved && (
        <div className="px-4 py-0.5 flex items-center gap-2 shrink-0" style={{ background: "#050d05", borderBottom: "1px solid #0e1e0e" }}>
          <span className="text-[9px] font-mono" style={{ color: "#2a4a2a" }}>
            Drag panel headers to rearrange · Click "Save Layout" to persist your arrangement
          </span>
        </div>
      )}

      {/* Panel Grid with DnD */}
      <DragDropContext onDragStart={() => setDragging(true)} onDragEnd={handleDragEnd}>
        <Droppable droppableId="terminal-panels" direction="horizontal">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`flex-1 grid overflow-hidden ${GRID_CLASSES[preset]}`}
              style={{
                height: "calc(100vh - 100px)",
                outline: snapshot.isDraggingOver ? "1px dashed #1a4a1a" : "none",
                transition: "outline 0.15s",
              }}
            >
              {panelOrder.map((panelId, index) => {
                const meta = ALL_PANELS.find(p => p.id === panelId);
                if (!meta) return null;

                return (
                  <Draggable key={panelId} draggableId={panelId} index={index}>
                    {(drag, dragSnap) => (
                      <div
                        ref={drag.innerRef}
                        {...drag.draggableProps}
                        className="flex flex-col overflow-hidden"
                        style={{
                          borderRight: "1px solid #1a2a1a",
                          borderBottom: "1px solid #1a2a1a",
                          opacity: dragSnap.isDragging ? 0.85 : 1,
                          boxShadow: dragSnap.isDragging ? "0 0 20px rgba(0,208,132,0.15)" : "none",
                          transition: "box-shadow 0.15s",
                          ...drag.draggableProps.style,
                        }}
                      >
                        <PanelHeader label={meta.label} dragHandleProps={drag.dragHandleProps} />
                        <div className="flex-1 overflow-hidden" style={{ minHeight: 0 }}>
                          <PanelComponent id={panelId} />
                        </div>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-1 shrink-0" style={{ background: "#040804", borderTop: "1px solid #1a2a1a" }}>
        <div className="flex items-center gap-4">
          <span className="text-[9px] font-mono" style={{ color: "#2a4a2a" }}>WF-TERMINAL v2.2.0</span>
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