import { Drawer } from "vaul";
import { Check } from "lucide-react";

export default function AssetDrawer({ open, onClose, assets, prices, selectedSymbol, onSelect }) {
  return (
    <Drawer.Root open={open} onOpenChange={v => !v && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40" style={{ background: "rgba(0,0,0,0.6)" }} />
        <Drawer.Content
          className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-2xl outline-none"
          style={{ background: "#111118", border: "1px solid #1e2030", maxHeight: "75vh" }}
        >
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-2 shrink-0">
            <div className="w-10 h-1 rounded-full" style={{ background: "#2e3236" }} />
          </div>
          <div className="px-5 pb-2 shrink-0">
            <h3 className="text-white font-bold text-lg">Select Asset</h3>
          </div>
          <div className="overflow-y-auto flex-1 pb-8">
            {assets.map(a => {
              const price = prices[a.symbol];
              const active = selectedSymbol === a.symbol;
              return (
                <button
                  key={a.symbol}
                  onClick={() => { onSelect(a.symbol); onClose(); }}
                  className="w-full flex items-center justify-between px-5 py-4 transition-all active:opacity-70"
                  style={{ borderBottom: "1px solid #1e2030", background: active ? "rgba(99,102,241,0.1)" : "transparent" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold"
                      style={{ background: "linear-gradient(145deg, #2a2d30, #202326)", border: "1px solid #2e3236", color: "#c8ced6" }}>
                      {a.symbol.slice(0, 2)}
                    </div>
                    <div className="text-left">
                      <div className="text-white font-semibold text-sm">{a.symbol}</div>
                      <div className="text-slate-500 text-xs">{a.name}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {price && (
                      <span className="text-indigo-300 text-sm font-mono">
                        ${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </span>
                    )}
                    {active && <Check className="w-4 h-4 text-indigo-400" />}
                  </div>
                </button>
              );
            })}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}