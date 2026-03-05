import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Check, Zap, BarChart3, PieChart, Star, Shield, TrendingUp, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

const FEATURES = [
  { icon: BarChart3, text: "Advanced portfolio analytics" },
  { icon: PieChart, text: "Custom ETF portfolio builder" },
  { icon: TrendingUp, text: "Real-time market terminal" },
  { icon: Star, text: "Watchlist with unlimited assets" },
  { icon: Shield, text: "Token-gated premium features" },
  { icon: Zap, text: "Priority data feeds" },
];

export default function Subscription() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // "success" | "cancelled" | null

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") setStatus("success");
    else if (params.get("cancelled") === "true") setStatus("cancelled");
  }, []);

  const handleSubscribe = async () => {
    // Block if running inside iframe (preview)
    if (window.self !== window.top) {
      alert("Checkout only works from the published app, not inside the preview.");
      return;
    }

    setLoading(true);
    try {
      const origin = window.location.origin;
      const response = await base44.functions.invoke("createSubscription", {
        successUrl: `${origin}/subscription?success=true`,
        cancelUrl: `${origin}/subscription?cancelled=true`,
      });
      if (response.data?.url) {
        window.location.href = response.data.url;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0d0f11" }}>
        <div className="text-center px-6 max-w-md">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 0 40px rgba(99,102,241,0.4)" }}>
            <Check className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white mb-3">You're Pro!</h1>
          <p className="text-slate-400 mb-8">Welcome to WorldFi Pro. All premium features are now unlocked.</p>
          <Button onClick={() => window.location.href = "/"}
            className="h-11 px-8 font-semibold rounded-xl"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-16" style={{ background: "#0d0f11" }}>
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-sm font-semibold"
            style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)", color: "#818cf8" }}>
            <Crown className="w-4 h-4" />
            WorldFi Pro
          </div>
          <h1 className="text-5xl font-black text-white mb-4 tracking-tight">
            Unlock Everything
          </h1>
          <p className="text-slate-400 text-lg">
            Full access to all trading tools, analytics, and premium features.
          </p>
        </div>

        {/* Pricing Card */}
        <div className="rounded-2xl overflow-hidden mb-6"
          style={{ background: "linear-gradient(145deg, #1c1f24, #161921)", border: "1px solid #252930", boxShadow: "0 2px 40px rgba(99,102,241,0.1)" }}>

          {/* Price */}
          <div className="px-8 pt-8 pb-6 text-center" style={{ borderBottom: "1px solid #1e2227" }}>
            <div className="flex items-end justify-center gap-1 mb-1">
              <span className="text-slate-400 text-lg mb-2">$</span>
              <span className="text-7xl font-black text-white">19</span>
              <span className="text-slate-400 text-2xl mb-2">.99</span>
            </div>
            <p className="text-slate-500 text-sm">per month · cancel anytime</p>
          </div>

          {/* Features */}
          <div className="px-8 py-6 space-y-4">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
                  <Icon className="w-4 h-4" style={{ color: "#818cf8" }} />
                </div>
                <span className="text-slate-300 text-sm">{text}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="px-8 pb-8">
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full h-14 rounded-xl font-bold text-white text-base transition-all active:scale-[0.98] disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 4px 20px rgba(99,102,241,0.35)" }}
            >
              {loading ? "Redirecting..." : "Subscribe Now — $19.99/mo"}
            </button>
            <p className="text-center text-slate-600 text-xs mt-3">
              Secured by Stripe · Cancel anytime from your account
            </p>
          </div>
        </div>

        {status === "cancelled" && (
          <p className="text-center text-slate-500 text-sm">Payment was cancelled. No charges made.</p>
        )}
      </div>
    </div>
  );
}