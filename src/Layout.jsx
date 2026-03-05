import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { BarChart3, Trophy, Zap, Bell, CreditCard, Home, Monitor, Star, Crown } from "lucide-react";
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

const navLinks = [
  { label: "Home", page: "Dashboard", icon: Home },
  { label: "Portfolios", page: "ETFPortfolios", icon: CreditCard },
  { label: "Showcase", page: "TokenShowcase", icon: Trophy },
  { label: "Watchlist", page: "Watchlist", icon: Star },
  { label: "Terminal", page: "Terminal", icon: Monitor },
  { label: "Pro", page: "Subscription", icon: Crown },
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
    <div className="min-h-screen" style={{ background: "#0d0f11", color: "#e2e8f0", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { font-family: 'Inter', -apple-system, sans-serif; box-sizing: border-box; }
        body { background: #0d0f11; margin: 0; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a2d32; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #3a3d44; }

        .nav-link { position: relative; transition: color 0.2s; }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -2px; left: 50%; right: 50%;
          height: 1.5px;
          background: linear-gradient(90deg, #6366f1, #8b5cf6);
          border-radius: 2px;
          transition: left 0.25s ease, right 0.25s ease;
        }
        .nav-link.active::after { left: 0; right: 0; }
        .nav-link:hover::after { left: 10%; right: 10%; }

        .avatar-ring {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          padding: 1.5px;
          border-radius: 50%;
        }

        /* Steel palette vars */
        .steel-card { background: linear-gradient(145deg, #16191d 0%, #131619 100%); border: 1px solid #1e2227; border-radius: 16px; }
        .steel-card-raised { background: linear-gradient(145deg, #1c1f24 0%, #161921 100%); border: 1px solid #252930; border-radius: 16px; box-shadow: 0 2px 16px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04); }
        .steel-btn { background: linear-gradient(135deg, #252930 0%, #1c2026 100%); border: 1px solid #2e333a; color: #c8ced6; font-weight: 600; border-radius: 10px; transition: all 0.15s; }
        .steel-btn:hover { background: linear-gradient(135deg, #2d333b 0%, #232830 100%); border-color: #3a4048; }
        .steel-btn-accent { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border: none; color: white; font-weight: 600; border-radius: 10px; transition: opacity 0.15s; box-shadow: 0 2px 12px rgba(99,102,241,0.25); }
        .steel-btn-accent:hover { opacity: 0.88; }

        .accent-blue { color: #818cf8; }
        .accent-green { color: #4ade80; }
        .accent-red { color: #f87171; }
        .accent-amber { color: #fbbf24; }
        .accent-silver { color: #94a3b8; }

        .surface { background: #131619; }
        .surface-2 { background: #191c21; }
        .surface-hover:hover { background: #1c2026; }
        .divider { border-color: #1e2227; }
        .text-muted { color: #64748b; }
        .text-soft { color: #94a3b8; }
      `}</style>

      {/* ── Top Navbar ──────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 h-13"
        style={{
          height: 52,
          background: scrolled ? "rgba(13,15,17,0.97)" : "rgba(13,15,17,0.85)",
          backdropFilter: "blur(20px)",
          borderBottom: scrolled ? "1px solid #1e2227" : "1px solid transparent",
          transition: "background 0.3s, border-color 0.3s",
        }}
      >
        <div className="max-w-7xl mx-auto h-full px-5 flex items-center justify-between gap-6">

          {/* Logo */}
          <Link to={createPageUrl("Dashboard")} className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 2px 10px rgba(99,102,241,0.35)" }}>
              <Zap className="w-3.5 h-3.5 text-white" fill="white" />
            </div>
            <span className="font-bold text-[15px] tracking-tight">
              <span style={{ color: "#f1f5f9" }}>World</span><span style={{ color: "#6366f1" }}>Fi</span>
            </span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-0 flex-1 justify-center">
            {navLinks.map(({ label, page, icon: Icon }) => {
              const active = currentPageName === page;
              return (
                <Link
                  key={page}
                  to={createPageUrl(page)}
                  className={`nav-link ${active ? "active" : ""} flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium transition-colors`}
                  style={{ color: active ? "#f1f5f9" : "#64748b" }}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color: active ? "#818cf8" : "currentColor" }} />
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Bell */}
            <button
              className="relative w-8 h-8 rounded-lg flex items-center justify-center transition-all"
              style={{ color: "#64748b", background: "rgba(255,255,255,0.03)" }}
              onMouseEnter={e => { e.currentTarget.style.color = "#94a3b8"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "#64748b"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                style={{ background: "#6366f1", boxShadow: "0 0 4px rgba(99,102,241,0.6)" }} />
            </button>

            {/* User chip */}
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl cursor-pointer transition-all"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #1e2227" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.borderColor = "#2e333a"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "#1e2227"; }}
            >
              <div className="avatar-ring">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                  style={{ background: "linear-gradient(135deg, #1c1f24, #131619)" }}>
                  {initials}
                </div>
              </div>
              {firstName && (
                <span className="text-sm hidden md:block font-medium" style={{ color: "#c8ced6" }}>{firstName}</span>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ── Mobile Bottom Nav ────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center px-2"
        style={{
          height: 60,
          background: "rgba(13,15,17,0.98)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid #1e2227",
        }}>
        {navLinks.map(({ label, page, icon: Icon }) => {
          const active = currentPageName === page;
          return (
            <Link
              key={page}
              to={createPageUrl(page)}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-1 transition-all"
              style={{ color: active ? "#818cf8" : "#3a4048" }}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {active && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ background: "#6366f1" }} />
                )}
              </div>
              <span className="text-[9px] font-semibold tracking-wide uppercase"
                style={{ color: active ? "#818cf8" : "#3a4048" }}>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Page content */}
      <main className="pt-[52px] pb-16 md:pb-0">
        {children}
      </main>
    </div>
  );
}