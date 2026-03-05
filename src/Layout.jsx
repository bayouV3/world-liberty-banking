import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Zap, Bell, Home, CreditCard, Trophy, Star, Monitor, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

const navLinks = [
  { label: "Home", page: "Dashboard", icon: Home },
  { label: "Portfolios", page: "ETFPortfolios", icon: CreditCard },
  { label: "Showcase", page: "TokenShowcase", icon: Trophy },
  { label: "Watchlist", page: "Watchlist", icon: Star },
  { label: "Terminal", page: "Terminal", icon: Monitor },
];

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const initials = user?.full_name
    ? user.full_name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : "WF";

  const firstName = user?.full_name?.split(" ")[0] || null;

  return (
    <div className="min-h-screen text-white" style={{ background: "#111214", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        * { font-family: 'Inter', -apple-system, sans-serif; box-sizing: border-box; }
        body { background: #111214; }

        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2e3035; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #3a3d44; }

        /* Core surfaces */
        .surface-base   { background: #111214; }
        .surface-1      { background: #18191d; }
        .surface-2      { background: #1e2024; }
        .surface-3      { background: #24262b; }
        .surface-raised { background: linear-gradient(145deg,#242628,#1b1d20); border:1px solid #2e3035; border-radius:16px; }
        .surface-card   { background: #18191d; border: 1px solid #252629; border-radius: 14px; }

        /* Borders */
        .border-subtle  { border-color: #252629; }
        .border-muted   { border-color: #2e3035; }

        /* Accent spectrum */
        .accent-blue    { color: #7eb3ff; }
        .accent-green   { color: #52c98b; }
        .accent-red     { color: #e87070; }
        .accent-amber   { color: #d4a94a; }
        .accent-purple  { color: #a78bfa; }
        .accent-silver  { color: #9ba3b0; }

        /* Glass */
        .glass { background: rgba(255,255,255,0.03); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.06); }

        /* Buttons */
        .btn-steel {
          background: linear-gradient(135deg,#2e3035,#232528);
          border: 1px solid #3a3d44;
          color: #d0d4db;
          font-weight: 600;
          border-radius: 10px;
          transition: all .15s;
        }
        .btn-steel:hover { background: linear-gradient(135deg,#363a40,#2a2d31); color: #e8eaec; }

        .btn-accent {
          background: linear-gradient(135deg,#5a7af0,#7c5ff5);
          border: 1px solid rgba(122,94,245,.35);
          color: #fff;
          font-weight: 600;
          border-radius: 10px;
          transition: opacity .15s;
        }
        .btn-accent:hover { opacity: .88; }

        /* Nav active indicator */
        .nav-active-dot {
          width: 3px;
          height: 3px;
          background: #52c98b;
          border-radius: 99px;
        }

        /* Shimmer for loading skeletons */
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .skeleton {
          background: linear-gradient(90deg,#1e2024 25%,#252629 50%,#1e2024 75%);
          background-size: 800px 100%;
          animation: shimmer 1.6s infinite;
          border-radius: 8px;
        }

        /* Ticker/terminal font */
        .font-mono-num { font-variant-numeric: tabular-nums; font-family: 'SF Mono', 'Fira Code', monospace; }
      `}</style>

      {/* ── Top Navbar ───────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 h-13 flex items-center transition-all duration-200"
        style={{
          height: 52,
          background: scrolled ? "rgba(17,18,20,0.97)" : "rgba(17,18,20,0.92)",
          backdropFilter: "blur(28px)",
          borderBottom: scrolled ? "1px solid #252629" : "1px solid rgba(37,38,41,0.6)",
          boxShadow: scrolled ? "0 1px 0 rgba(0,0,0,0.4)" : "none",
        }}
      >
        <div className="max-w-7xl mx-auto w-full px-4 flex items-center gap-6">

          {/* Logo */}
          <Link to={createPageUrl("Dashboard")} className="flex items-center gap-2 shrink-0 group">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all group-hover:scale-105"
              style={{
                background: "linear-gradient(145deg,#3a3d44,#27292d)",
                border: "1px solid #44474e",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
              }}
            >
              <Zap className="w-3.5 h-3.5" style={{ color: "#c0c6d0" }} />
            </div>
            <span className="font-bold text-sm tracking-tight">
              <span style={{ color: "#e2e5ea" }}>World</span><span style={{ color: "#4a5568" }}>Fi</span>
            </span>
          </Link>

          {/* Divider */}
          <div className="hidden md:block w-px h-5 shrink-0" style={{ background: "#252629" }} />

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-0.5 flex-1">
            {navLinks.map(({ label, page, icon: Icon }) => {
              const active = currentPageName === page;
              return (
                <Link
                  key={page}
                  to={createPageUrl(page)}
                  className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150"
                  style={{
                    color: active ? "#e2e5ea" : "#5a6070",
                    background: active ? "rgba(255,255,255,0.055)" : "transparent",
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.color = "#9ba3b0"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.color = "#5a6070"; e.currentTarget.style.background = "transparent"; } }}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  {label}
                  {active && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 nav-active-dot" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Notification bell */}
            <button
              className="relative p-1.5 rounded-lg transition-all"
              style={{ color: "#4a5568", background: "transparent" }}
              onMouseEnter={e => { e.currentTarget.style.color = "#9ba3b0"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "#4a5568"; e.currentTarget.style.background = "transparent"; }}
            >
              <Bell className="w-4 h-4" />
              <span
                className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                style={{ background: "#52c98b", boxShadow: "0 0 4px rgba(82,201,139,0.6)" }}
              />
            </button>

            {/* User chip */}
            <div
              className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl cursor-pointer transition-all"
              style={{
                background: "linear-gradient(145deg,#1e2024,#171a1d)",
                border: "1px solid #2e3035",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#3a3d44"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#2e3035"; }}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                style={{
                  background: "linear-gradient(145deg,#3a3d44,#27292d)",
                  color: "#c0c6d0",
                  border: "1px solid #44474e",
                }}
              >
                {initials}
              </div>
              {firstName && (
                <span className="hidden md:block text-[13px] font-medium" style={{ color: "#9ba3b0" }}>{firstName}</span>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ── Mobile Bottom Nav ─────────────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center px-2"
        style={{
          height: 60,
          background: "rgba(17,18,20,0.98)",
          backdropFilter: "blur(28px)",
          borderTop: "1px solid #252629",
        }}
      >
        {navLinks.map(({ label, page, icon: Icon }) => {
          const active = currentPageName === page;
          return (
            <Link
              key={page}
              to={createPageUrl(page)}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-1 rounded-xl mx-0.5 transition-all"
              style={{
                color: active ? "#e2e5ea" : "#3a4050",
                background: active ? "rgba(255,255,255,0.05)" : "transparent",
              }}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[9px] font-semibold tracking-wide">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ── Page content ──────────────────────────────────────── */}
      <main className="pt-[52px] pb-[60px] md:pb-0">
        {children}
      </main>
    </div>
  );
}