import React, { createContext, useContext, useState, useEffect } from "react";

export type Currency = "USD" | "AED" | "INR";

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: "$",
  AED: "د.إ",
  INR: "₹",
};

interface CurrencyContextType {
  currency: Currency;
  currencySymbol: string;
  setCurrency: (c: Currency) => void;
  formatMoney: (amount?: number | null) => string;
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

  return (
    <CurrencyContext.Provider value={{ currency, currencySymbol: CURRENCY_SYMBOLS[currency], setCurrency, formatMoney }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error("useCurrency must be used within CurrencyProvider");
  return context;
}
