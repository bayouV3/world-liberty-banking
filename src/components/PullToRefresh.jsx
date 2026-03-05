import { useState, useRef, useCallback } from "react";
import { RefreshCw } from "lucide-react";

const THRESHOLD = 70;

export default function PullToRefresh({ onRefresh, children }) {
  const [pullY, setPullY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(null);
  const pulling = useRef(false);

  const onTouchStart = useCallback((e) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
      pulling.current = true;
    }
  }, []);

  const onTouchMove = useCallback((e) => {
    if (!pulling.current || startY.current === null) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0) {
      setPullY(Math.min(delta * 0.5, THRESHOLD + 20));
    }
  }, []);

  const onTouchEnd = useCallback(async () => {
    if (!pulling.current) return;
    pulling.current = false;

    if (pullY >= THRESHOLD && !refreshing) {
      setRefreshing(true);
      setPullY(THRESHOLD);
      await onRefresh();
      setRefreshing(false);
    }
    setPullY(0);
    startY.current = null;
  }, [pullY, refreshing, onRefresh]);

  const progress = Math.min(pullY / THRESHOLD, 1);

  return (
    <div onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} style={{ position: "relative" }}>
      {/* Pull indicator */}
      {(pullY > 0 || refreshing) && (
        <div className="flex items-center justify-center absolute top-0 left-0 right-0 z-10 pointer-events-none"
          style={{ height: pullY || (refreshing ? THRESHOLD : 0), transition: refreshing ? "height 0.2s" : "none" }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", opacity: progress }}>
            <RefreshCw className="w-4 h-4" style={{ color: "#818cf8", transform: `rotate(${progress * 360}deg)`, transition: refreshing ? "transform 0.8s linear infinite" : "none", animation: refreshing ? "spin 0.8s linear infinite" : "none" }} />
          </div>
        </div>
      )}
      <div style={{ transform: `translateY(${pullY}px)`, transition: pullY === 0 ? "transform 0.25s ease" : "none" }}>
        {children}
      </div>
    </div>
  );
}