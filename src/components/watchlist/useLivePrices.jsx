import { useState, useEffect, useRef } from "react";

const COINGECKO_IDS = {
  BTC: "bitcoin", ETH: "ethereum", SOL: "solana", BNB: "binancecoin",
  ADA: "cardano", DOGE: "dogecoin", XRP: "ripple", AVAX: "avalanche-2",
  DOT: "polkadot", LINK: "chainlink", LTC: "litecoin", UNI: "uniswap",
  MATIC: "matic-network", ATOM: "cosmos",
};

// Seed prices for stocks & forex
const SEED_PRICES = {
  AAPL: 178.42, MSFT: 415.20, NVDA: 875.64, GOOGL: 164.32, TSLA: 242.11,
  AMZN: 192.45, META: 527.80, NFLX: 628.40, JPM: 198.32, V: 278.50,
  "EUR/USD": 1.0842, "GBP/USD": 1.2634, "USD/JPY": 149.84, "AUD/USD": 0.6512,
  "USD/CHF": 0.8932, "USD/CAD": 1.3621,
};

const SEED_CHANGES = {
  AAPL: 0.83, MSFT: 0.62, NVDA: 3.21, GOOGL: -0.34, TSLA: -1.87,
  AMZN: 0.95, META: 1.42, NFLX: 0.78, JPM: 0.45, V: 0.22,
  "EUR/USD": 0.12, "GBP/USD": -0.08, "USD/JPY": 0.32, "AUD/USD": -0.15,
  "USD/CHF": 0.06, "USD/CAD": -0.11,
};

export function useLivePrices(symbols = []) {
  const [prices, setPrices] = useState({});
  const [changes, setChanges] = useState({});
  const [loading, setLoading] = useState(true);
  const simulatedRef = useRef({});

  const cryptoSymbols = symbols.filter(s => COINGECKO_IDS[s]);
  const otherSymbols = symbols.filter(s => !COINGECKO_IDS[s]);

  // Initialize simulated prices
  useEffect(() => {
    const init = {};
    const initChanges = {};
    otherSymbols.forEach(s => {
      init[s] = SEED_PRICES[s] || 100;
      initChanges[s] = SEED_CHANGES[s] || 0;
    });
    simulatedRef.current = init;
    setPrices(prev => ({ ...prev, ...init }));
    setChanges(prev => ({ ...prev, ...initChanges }));
  }, [otherSymbols.join(",")]);

  // Fetch real crypto prices from CoinGecko
  useEffect(() => {
    if (!cryptoSymbols.length) { setLoading(false); return; }
    const ids = cryptoSymbols.map(s => COINGECKO_IDS[s]).join(",");

    const fetchCrypto = async () => {
      try {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
        );
        const data = await res.json();
        const newPrices = {};
        const newChanges = {};
        cryptoSymbols.forEach(sym => {
          const id = COINGECKO_IDS[sym];
          if (data[id]) {
            newPrices[sym] = data[id].usd;
            newChanges[sym] = data[id].usd_24h_change || 0;
          }
        });
        setPrices(prev => ({ ...prev, ...newPrices }));
        setChanges(prev => ({ ...prev, ...newChanges }));
      } catch (e) {
        // fallback: use seed or existing
      }
      setLoading(false);
    };

    fetchCrypto();
    const id = setInterval(fetchCrypto, 30000);
    return () => clearInterval(id);
  }, [cryptoSymbols.join(",")]);

  // Simulate live ticks for stocks & forex
  useEffect(() => {
    if (!otherSymbols.length) return;
    const id = setInterval(() => {
      const updates = {};
      const changeUpdates = {};
      otherSymbols.forEach(s => {
        const curr = simulatedRef.current[s] || SEED_PRICES[s] || 100;
        const delta = curr * (Math.random() - 0.5) * 0.0006;
        const next = parseFloat((curr + delta).toFixed(curr < 10 ? 4 : 2));
        simulatedRef.current[s] = next;
        updates[s] = next;
        // Update 24h change slightly
        changeUpdates[s] = parseFloat(((SEED_CHANGES[s] || 0) + (Math.random() - 0.5) * 0.02).toFixed(2));
      });
      setPrices(prev => ({ ...prev, ...updates }));
      setChanges(prev => ({ ...prev, ...changeUpdates }));
    }, 1500);
    return () => clearInterval(id);
  }, [otherSymbols.join(",")]);

  return { prices, changes, loading };
}

export const ALL_ASSETS = [
  // Stocks
  { symbol: "AAPL", name: "Apple Inc.", type: "stock" },
  { symbol: "MSFT", name: "Microsoft", type: "stock" },
  { symbol: "NVDA", name: "NVIDIA Corp", type: "stock" },
  { symbol: "GOOGL", name: "Alphabet", type: "stock" },
  { symbol: "TSLA", name: "Tesla", type: "stock" },
  { symbol: "AMZN", name: "Amazon", type: "stock" },
  { symbol: "META", name: "Meta Platforms", type: "stock" },
  { symbol: "NFLX", name: "Netflix", type: "stock" },
  { symbol: "JPM", name: "JPMorgan Chase", type: "stock" },
  { symbol: "V", name: "Visa Inc.", type: "stock" },
  // Crypto
  { symbol: "BTC", name: "Bitcoin", type: "crypto" },
  { symbol: "ETH", name: "Ethereum", type: "crypto" },
  { symbol: "SOL", name: "Solana", type: "crypto" },
  { symbol: "BNB", name: "BNB", type: "crypto" },
  { symbol: "XRP", name: "XRP", type: "crypto" },
  { symbol: "ADA", name: "Cardano", type: "crypto" },
  { symbol: "DOGE", name: "Dogecoin", type: "crypto" },
  { symbol: "AVAX", name: "Avalanche", type: "crypto" },
  { symbol: "DOT", name: "Polkadot", type: "crypto" },
  { symbol: "LINK", name: "Chainlink", type: "crypto" },
  // Forex
  { symbol: "EUR/USD", name: "Euro / US Dollar", type: "forex" },
  { symbol: "GBP/USD", name: "British Pound / Dollar", type: "forex" },
  { symbol: "USD/JPY", name: "Dollar / Japanese Yen", type: "forex" },
  { symbol: "AUD/USD", name: "Australian Dollar / USD", type: "forex" },
  { symbol: "USD/CHF", name: "Dollar / Swiss Franc", type: "forex" },
  { symbol: "USD/CAD", name: "Dollar / Canadian Dollar", type: "forex" },
];