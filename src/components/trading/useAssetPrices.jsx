import { useState, useEffect } from "react";

// CoinGecko IDs for each symbol
const COINGECKO_IDS = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  BNB: "binancecoin",
  ADA: "cardano",
  DOGE: "dogecoin",
};

// Fallback static prices for stock symbols
const STATIC_PRICES = {
  AAPL: 178.32,
  GOOGL: 141.56,
  MSFT: 378.91,
  TSLA: 248.93,
  AMZN: 178.25,
};

export function useAssetPrices(symbols = []) {
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!symbols.length) return;

    const cryptoSymbols = symbols.filter(s => COINGECKO_IDS[s]);
    const ids = cryptoSymbols.map(s => COINGECKO_IDS[s]).join(",");

    const fetchPrices = async () => {
      setLoading(true);
      const newPrices = { ...STATIC_PRICES };

      if (ids) {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
        );
        const data = await res.json();
        cryptoSymbols.forEach(sym => {
          const id = COINGECKO_IDS[sym];
          if (data[id]) {
            newPrices[sym] = data[id].usd;
            newPrices[`${sym}_change`] = data[id].usd_24h_change;
          }
        });
      }

      setPrices(newPrices);
      setLoading(false);
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [symbols.join(",")]);

  return { prices, loading };
}