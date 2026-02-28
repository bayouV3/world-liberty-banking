import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { BarChart3, Trophy, Zap, Bell, User, CreditCard, Home } from "lucide-react";
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const navLinks = [
    { label: "Home", page: "Dashboard", icon: Home },
    { label: "Portfolios", page: "ETFPortfolios", icon: CreditCard },
    { label: "Showcase", page: "TokenShowcase", icon: Trophy },
  ];

  const initials = user?.full_name
    ? user.full_name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : "WF";

  return (
    <div className="min-h-screen text-white" style={{ fontFamily: "'Inter', -apple-system, sans-serif", background: "#1a1c1e" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { font-family: 'Inter', -apple-system, sans-serif; box-sizing: border-box; }
        body { background: #1a1c1e; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #3a3d42; border-radius: 4px; }

        /* Steel palette */
        .steel-bg { background: #1a1c1e; }
        .steel-card { background: linear-gradient(145deg, #232628 0%, #1e2022 100%); border: 1px solid #3a3d42; border-radius: 16px; }
        .steel-card-raised { background: linear-gradient(145deg, #2a2d30 0%, #202326 100%); border: 1px solid #44474c; border-radius: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06); }
        .steel-glass { background: rgba(255,255,255,0.04); backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,0.07); }
        .steel-btn { background: linear-gradient(135deg, #4a4e55 0%, #35383d 100%); border: 1px solid #555960; color: #e8eaec; font-weight: 600; border-radius: 10px; transition: all 0.15s; }
        .steel-btn:hover { background: linear-gradient(135deg, #565a62 0%, #3e4248 100%); }
        .steel-btn-accent { background: linear-gradient(135deg, #5a7af0 0%, #7c5ff5 100%); border: 1px solid rgba(122,94,245,0.4); color: white; font-weight: 600; border-radius: 10px; transition: opacity 0.15s; }
        .steel-btn-accent:hover { opacity: 0.88; }
        .steel-shine { background: linear-gradient(135deg, #2e3236 0%, #24272a 50%, #2e3236 100%); }
        .steel-divider { border-color: #2e3236; }

        /* Accent colors — desaturated / metallic */
        .accent-blue { color: #7eb3ff; }
        .accent-green { color: #5ecb94; }
        .accent-red { color: #e87070; }
        .accent-amber { color: #d4a94a; }
        .accent-silver { color: #adb5bd; }

        .surface { background: #222528; }
        .surface-hover:hover { background: #2a2d31; }
      `}</style>

      {/* Top navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center border-b"
        style={{ background: "rgba(26,28,30,0.96)", backdropFilter: "blur(24px)", borderColor: "#3a3d42" }}>
        <div className="max-w-7xl mx-auto w-full px-5 flex items-center justify-between">

          {/* Logo */}
          <Link to={createPageUrl("Dashboard")} className="flex items-center gap-2.5 mr-8">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-base tracking-tight">
              <span className="text-white">World</span><span className="text-indigo-400">Fi</span>
            </span>
          </Link>

          {/* Nav */}
          <div className="hidden md:flex items-center gap-0.5 flex-1">
            {navLinks.map(({ label, page, icon: Icon }) => {
              const active = currentPageName === page;
              return (
                <Link
                  key={page}
                  to={createPageUrl(page)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all
                    ${active ? "text-white bg-white/[0.08]" : "text-slate-500 hover:text-slate-200 hover:bg-white/[0.04]"}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.05] transition-all">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl cursor-pointer hover:bg-white/[0.05] transition-all border border-white/[0.06]">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                {initials}
              </div>
              <span className="text-sm text-slate-300 hidden md:block font-medium">
                {user?.full_name?.split(' ')[0] || "Account"}
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.06] h-16 flex items-center px-4"
        style={{ background: "rgba(10,10,15,0.97)", backdropFilter: "blur(24px)" }}>
        {navLinks.map(({ label, page, icon: Icon }) => {
          const active = currentPageName === page;
          return (
            <Link key={page} to={createPageUrl(page)}
              className={`flex-1 flex flex-col items-center gap-1 py-1 transition-all
                ${active ? "text-indigo-400" : "text-slate-600 hover:text-slate-400"}`}>
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Page content */}
      <main className="pt-14 pb-16 md:pb-0">
        {children}
      </main>
    </div>
  );
}