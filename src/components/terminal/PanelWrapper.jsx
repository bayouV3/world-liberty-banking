import { GripVertical } from "lucide-react";

export function PanelHeader({ label, dragHandleProps }) {
  return (
    <div
      className="flex items-center justify-between px-3 py-1.5 shrink-0 select-none"
      style={{ background: "#080e08", borderBottom: "1px solid #1a2a1a" }}
    >
      <div className="flex items-center gap-2">
        <div
          {...dragHandleProps}
          className="cursor-grab active:cursor-grabbing p-0.5 rounded hover:opacity-60 transition-opacity"
          title="Drag to rearrange"
        >
          <GripVertical className="w-3 h-3" style={{ color: "#2a4a2a" }} />
        </div>
        <span className="text-[9px] font-mono font-bold uppercase tracking-widest" style={{ color: "#3a6a3a" }}>
          {label}
        </span>
      </div>
      <div className="flex gap-1.5">
        <div className="w-2 h-2 rounded-full" style={{ background: "#ff4444", opacity: 0.5 }} />
        <div className="w-2 h-2 rounded-full" style={{ background: "#ffaa00", opacity: 0.5 }} />
        <div className="w-2 h-2 rounded-full" style={{ background: "#00d084", opacity: 0.5 }} />
      </div>
    </div>
  );
}