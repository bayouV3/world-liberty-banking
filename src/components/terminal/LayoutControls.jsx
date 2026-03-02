import { LayoutGrid, Monitor, Maximize2, RotateCcw, Save, Check } from "lucide-react";
import { useState } from "react";

const PRESET_LAYOUTS = [
  { id: "4-panel", label: "4 Panel", icon: LayoutGrid },
  { id: "2-panel", label: "2 Panel", icon: Monitor },
  { id: "market-focus", label: "Market Focus", icon: Maximize2 },
];

export default function LayoutControls({ currentPreset, onPresetChange, onSave, onReset, hasSaved }) {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="hidden md:flex items-center gap-2">
      {/* Preset layout switcher */}
      <div className="flex items-center gap-0.5 px-1 py-0.5 rounded" style={{ background: "#0a1a0a", border: "1px solid #1a3a1a" }}>
        {PRESET_LAYOUTS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => onPresetChange(id)}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider transition-all"
            style={{
              background: currentPreset === id ? "#1a3a1a" : "transparent",
              color: currentPreset === id ? "#00d084" : "#3a5a3a",
            }}>
            <Icon className="w-2.5 h-2.5" />{label}
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="w-px h-4" style={{ background: "#1a3a1a" }} />

      {/* Save layout */}
      <button onClick={handleSave}
        className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono uppercase tracking-wider transition-all"
        style={{ background: "#0a1a0a", color: saved ? "#00d084" : "#3a5a3a", border: "1px solid #1a3a1a" }}>
        {saved ? <Check className="w-2.5 h-2.5" /> : <Save className="w-2.5 h-2.5" />}
        {saved ? "Saved!" : "Save Layout"}
      </button>

      {/* Reset */}
      {hasSaved && (
        <button onClick={onReset}
          className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono uppercase tracking-wider transition-all"
          style={{ background: "#1a0a0a", color: "#ff4444", border: "1px solid #3a1a1a" }}>
          <RotateCcw className="w-2.5 h-2.5" />
          Reset
        </button>
      )}
    </div>
  );
}