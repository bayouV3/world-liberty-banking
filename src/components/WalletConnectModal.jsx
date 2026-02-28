import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Wallet, CheckCircle2, XCircle, Loader2, ExternalLink, Copy, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TOKEN_GATES } from "@/components/TokenGate";

// ─── Wallet provider helpers ────────────────────────────────────────────────

async function connectMetaMask() {
  if (!window.ethereum?.isMetaMask) {
    throw new Error("MetaMask not detected. Please install the MetaMask extension.");
  }
  const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
  return accounts[0];
}

async function connectWalletConnect() {
  // WalletConnect v2 is a heavy SDK; for now we surface a QR-code fallback via
  // a deep-link URI pattern and let users connect via the WalletConnect modal
  // in their mobile wallet. In production you'd integrate @walletconnect/modal.
  throw new Error("WalletConnect integration requires @walletconnect/modal SDK. Please use MetaMask or enter your address manually.");
}

// ─── Component ──────────────────────────────────────────────────────────────

const WALLET_PROVIDERS = [
  {
    id: "metamask",
    label: "MetaMask",
    icon: "https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg",
    connect: connectMetaMask,
  },
  {
    id: "walletconnect",
    label: "WalletConnect",
    icon: "https://avatars.githubusercontent.com/u/37784886?s=200&v=4",
    connect: connectWalletConnect,
  },
];

export default function WalletConnectModal({ onClose, onConnected }) {
  const [step, setStep] = useState("choose"); // choose | manual | result
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [manualInput, setManualInput] = useState("");
  const [found, setFound] = useState(null);
  const [showTiers, setShowTiers] = useState(false);

  const { data: holders = [] } = useQuery({
    queryKey: ["token_holders"],
    queryFn: () => base44.entities.TokenHolder.list("-tokens_held"),
    initialData: [],
  });

  // Lookup token holdings by address or username in the TokenHolder entity
  const verifyAddress = (addr) => {
    const match = holders.find(
      (h) =>
        h.username?.toLowerCase() === addr.trim().toLowerCase() ||
        h.wallet_address?.toLowerCase() === addr.trim().toLowerCase()
    );
    setFound(match ?? null);
    setWalletAddress(addr.trim());
    setStep("result");
  };

  const handleProviderConnect = async (provider) => {
    setError(null);
    setLoading(true);
    try {
      const addr = await provider.connect();
      verifyAddress(addr);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = () => {
    if (!manualInput.trim()) return;
    verifyAddress(manualInput);
  };

  const handleConfirm = () => {
    onConnected(found);
    onClose();
  };

  const gates = Object.values(TOKEN_GATES);
  const short = (addr) => addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0d1117] border border-white/10 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 p-6 border-b border-white/5">
          <div className="p-2.5 rounded-xl bg-blue-500/15 border border-blue-500/25">
            <Wallet className="w-5 h-5 text-blue-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-white font-bold text-lg">Connect Wallet</h2>
            <p className="text-slate-500 text-xs">Verify token ownership to unlock features</p>
          </div>
          <button onClick={onClose} className="text-slate-600 hover:text-slate-300 text-xl leading-none">✕</button>
        </div>

        <div className="p-6 space-y-4">
          {/* Access tier toggle */}
          <button
            onClick={() => setShowTiers(v => !v)}
            className="w-full flex items-center justify-between text-sm text-slate-400 hover:text-white transition-colors"
          >
            <span>View required token tiers</span>
            {showTiers ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showTiers && (
            <div className="space-y-1.5">
              {gates.map(g => (
                <div key={g.label} className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-sm">
                  <span className="text-slate-300">{g.label}</span>
                  <span className="font-mono text-xs text-slate-500">{g.min_quantity.toLocaleString()}+ {g.required_token}</span>
                </div>
              ))}
            </div>
          )}

          {/* ── STEP: choose ── */}
          {step === "choose" && (
            <div className="space-y-3">
              {WALLET_PROVIDERS.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleProviderConnect(p)}
                  disabled={loading}
                  className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all text-left"
                >
                  <img src={p.icon} alt={p.label} className="w-8 h-8 rounded-lg object-contain" />
                  <span className="text-white font-medium flex-1">{p.label}</span>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin text-blue-400" /> : <ExternalLink className="w-4 h-4 text-slate-600" />}
                </button>
              ))}

              {error && (
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-sm">
                  <span className="mt-0.5">⚠</span>
                  <span>{error}</span>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-slate-600 text-xs">or</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <button
                onClick={() => setStep("manual")}
                className="w-full text-sm text-slate-400 hover:text-white transition-colors py-1"
              >
                Enter address / username manually
              </button>
            </div>
          )}

          {/* ── STEP: manual ── */}
          {step === "manual" && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualInput}
                  onChange={e => setManualInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleManualSubmit()}
                  placeholder="0x… or username"
                  className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500/50"
                />
                <Button onClick={handleManualSubmit} disabled={!manualInput.trim()} className="bg-blue-600 hover:bg-blue-500 px-4">
                  Verify
                </Button>
              </div>
              <button onClick={() => { setStep("choose"); setError(null); }} className="text-sm text-slate-500 hover:text-white transition-colors">
                ← Back
              </button>
            </div>
          )}

          {/* ── STEP: result ── */}
          {step === "result" && (
            <div className="space-y-4">
              {/* Address pill */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10">
                <Wallet className="w-4 h-4 text-slate-500" />
                <span className="text-slate-300 text-sm font-mono flex-1">{short(walletAddress) || walletAddress}</span>
                <button onClick={() => navigator.clipboard.writeText(walletAddress)} className="text-slate-600 hover:text-slate-300">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>

              {found ? (
                <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <div className="text-white font-semibold">{found.username}</div>
                      <div className="text-emerald-400 text-sm">{found.tokens_held?.toLocaleString()} WFI tokens verified ✓</div>
                    </div>
                  </div>
                  {/* Which features are unlocked */}
                  <div className="space-y-1">
                    {gates.map(g => {
                      const ok = (found.tokens_held ?? 0) >= g.min_quantity;
                      return (
                        <div key={g.label} className="flex items-center justify-between text-xs">
                          <span className={ok ? "text-emerald-300" : "text-slate-500"}>{g.label}</span>
                          <span className={ok ? "text-emerald-400" : "text-slate-600"}>{ok ? "✓ Unlocked" : `Need ${g.min_quantity.toLocaleString()}`}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-red-500/25 bg-red-500/10 p-4">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-white font-semibold mb-1">No holdings found</div>
                      <div className="text-slate-400 text-sm">
                        We couldn't find any WFI token holdings linked to this address. Make sure you're using the correct wallet address or username.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <button onClick={() => { setStep("choose"); setError(null); setFound(null); }} className="text-sm text-slate-500 hover:text-white transition-colors">
                ← Try a different wallet
              </button>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex gap-2 px-6 pb-6">
          <Button variant="ghost" onClick={onClose} className="flex-1 text-slate-400 hover:text-white border border-white/10">
            Cancel
          </Button>
          {step === "result" && (
            <Button
              onClick={found ? handleConfirm : () => { setStep("choose"); setFound(null); }}
              className={`flex-1 ${found ? "bg-emerald-600 hover:bg-emerald-500" : "bg-slate-700 hover:bg-slate-600"} text-white`}
            >
              {found ? "Confirm Access" : "Try Again"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}