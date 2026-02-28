import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Wallet, Search, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TOKEN_GATES } from "@/components/TokenGate";

export default function WalletConnectModal({ onClose, onConnected }) {
  const [address, setAddress] = useState("");
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [found, setFound] = useState(null); // TokenHolder record or null

  const { data: holders = [] } = useQuery({
    queryKey: ["token_holders"],
    queryFn: () => base44.entities.TokenHolder.list("-tokens_held"),
    initialData: [],
  });

  const handleConnect = async () => {
    if (!address.trim()) return;
    setLoading(true);
    setSearched(false);
    await new Promise(r => setTimeout(r, 900)); // simulate lookup
    // Match by username (demo: treat input as username/wallet address)
    const match = holders.find(h =>
      h.username?.toLowerCase() === address.trim().toLowerCase()
    );
    setFound(match ?? null);
    setSearched(true);
    setLoading(false);
  };

  const handleConfirm = () => {
    onConnected(found);
    onClose();
  };

  const gates = Object.values(TOKEN_GATES);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0d1117] border border-white/10 rounded-3xl w-full max-w-md p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-blue-500/15 border border-blue-500/25">
            <Wallet className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">Connect Wallet</h2>
            <p className="text-slate-500 text-xs">Verify your token holdings for access</p>
          </div>
        </div>

        {/* Access tiers */}
        <div className="space-y-2 mb-5">
          {gates.map(g => (
            <div key={g.label} className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-sm">
              <span className="text-slate-300">{g.label}</span>
              <span className="text-slate-500">{g.min_quantity.toLocaleString()}+ {g.required_token}</span>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={address}
            onChange={e => setAddress(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleConnect()}
            placeholder="Enter wallet address or username…"
            className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500/50"
          />
          <Button onClick={handleConnect} disabled={loading || !address.trim()} className="bg-blue-600 hover:bg-blue-500 px-4">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
        </div>

        {/* Result */}
        {searched && (
          <div className={`rounded-2xl border p-4 mb-4 ${found ? "bg-emerald-500/10 border-emerald-500/25" : "bg-red-500/10 border-red-500/25"}`}>
            {found ? (
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-white font-semibold">{found.username}</div>
                  <div className="text-emerald-400 text-sm">{found.tokens_held?.toLocaleString()} tokens verified</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                <div className="text-slate-400 text-sm">No wallet found for "<span className="text-white">{address}</span>"</div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onClose} className="flex-1 text-slate-400 hover:text-white border border-white/10">
            Cancel
          </Button>
          {found && (
            <Button onClick={handleConfirm} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white">
              Confirm Access
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}