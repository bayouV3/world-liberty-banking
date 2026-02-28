import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { BarChart3, Trophy, Zap, Bell, User } from "lucide-react";
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const navLinks = [
    { label: "Dashboard", page: "Dashboard", icon: BarChart3 },
    { label: "Token Showcase", page: "TokenShowcase", icon: Trophy },
  ];

  return (
    <div className="min-h-screen bg-[#060810] text-white font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { font-family: 'Inter', sans-serif; }
        .glow-blue { box-shadow: 0 0 40px rgba(59,130,246,0.15); }
        .glow-text { text-shadow: 0 0 30px rgba(99,179,237,0.5); }
        .glass { background: rgba(255,255,255,0.04); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); }
        .gradient-border { background: linear-gradient(135deg, rgba(59,130,246,0.3), rgba(139,92,246,0.3)); }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #060810; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 4px; }
      `}</style>

      {/* Top navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to={createPageUrl("Dashboard")} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              <span className="text-white">World</span>
              <span className="text-blue-400">Fi</span>
            </span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ label, page, icon: Icon }) => (
              <Link
                key={page}
                to={createPageUrl(page)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${currentPageName === page
                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                    : "text-slate-400 hover:text-white hover:bg-white/5"}`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass cursor-pointer hover:bg-white/5 transition-all">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                <User className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm text-slate-300 hidden md:block">
                {user?.full_name?.split(' ')[0] || "Account"}
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Page content */}
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
}