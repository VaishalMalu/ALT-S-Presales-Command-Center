import React, { createContext, useContext, useState, useEffect } from "react";

export type Currency = "USD" | "AED" | "INR";

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: "$",
  AED: "AED ",
  INR: "₹",
};

interface CurrencyContextType {
  currency: Currency;
  currencySymbol: string;
  setCurrency: (c: Currency) => void;
  formatMoney: (amount?: number | null) => string;
  formatCompactMoney: (amount?: number | null) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("USD");

  useEffect(() => {
    const saved = localStorage.getItem("preferred_currency") as Currency;
    if (saved && CURRENCY_SYMBOLS[saved]) {
      setCurrencyState(saved);
    }
  }, []);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem("preferred_currency", c);
  };

  const formatMoney = (amount?: number | null) => {
    if (amount === undefined || amount === null) return `${CURRENCY_SYMBOLS[currency]}0`;
    return `${CURRENCY_SYMBOLS[currency]}${Math.round(Number(amount)).toLocaleString()}`;
  };

  const formatCompactMoney = (amount?: number | null) => {
    if (amount === undefined || amount === null) return `${CURRENCY_SYMBOLS[currency]}0`;
    
    const num = Number(amount);
    
    if (currency === "INR") {
      if (num >= 10000000) return `${CURRENCY_SYMBOLS[currency]}${(num / 10000000).toFixed(1)}Cr`;
      if (num >= 100000) return `${CURRENCY_SYMBOLS[currency]}${(num / 100000).toFixed(1)}L`;
      if (num >= 1000) return `${CURRENCY_SYMBOLS[currency]}${(num / 1000).toFixed(1)}K`;
      return `${CURRENCY_SYMBOLS[currency]}${num.toFixed(0)}`;
    }
    
    // For USD and AED (International System)
    if (num >= 1000000000) return `${CURRENCY_SYMBOLS[currency]}${(num / 1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `${CURRENCY_SYMBOLS[currency]}${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${CURRENCY_SYMBOLS[currency]}${(num / 1000).toFixed(1)}K`;
    
    return `${CURRENCY_SYMBOLS[currency]}${num.toFixed(0)}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, currencySymbol: CURRENCY_SYMBOLS[currency], setCurrency, formatMoney, formatCompactMoney }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error("useCurrency must be used within CurrencyProvider");
  return context;
}
