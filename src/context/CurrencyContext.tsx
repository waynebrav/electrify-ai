import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSystemSettings } from '@/hooks/useSystemSettings';

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  decimal_digits: number;
  rounding: number;
}

export const SUPPORTED_CURRENCIES: Currency[] = [
  {
    code: "KES",
    symbol: "KSh",
    name: "Kenyan Shilling",
    decimal_digits: 2,
    rounding: 0
  },
  {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    decimal_digits: 2,
    rounding: 0
  },
  {
    code: "EUR",
    symbol: "€",
    name: "Euro",
    decimal_digits: 2,
    rounding: 0
  }
];

// Exchange rates (in a real app, these would come from an API)
const EXCHANGE_RATES: Record<string, Record<string, number>> = {
  KES: {
    KES: 1,
    USD: 0.0077, // 1 KES = 0.0077 USD
    EUR: 0.0071  // 1 KES = 0.0071 EUR
  },
  USD: {
    KES: 129.5,  // 1 USD = 129.5 KES
    USD: 1,
    EUR: 0.92    // 1 USD = 0.92 EUR
  },
  EUR: {
    KES: 141.0,  // 1 EUR = 141.0 KES
    USD: 1.09,   // 1 EUR = 1.09 USD
    EUR: 1
  }
};

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  convertPrice: (price: number, fromCurrency?: string) => number;
  formatPrice: (price: number, fromCurrency?: string) => string;
  exchangeRates: Record<string, Record<string, number>>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>(SUPPORTED_CURRENCIES[0]); // Default to KES
  const [isInitialized, setIsInitialized] = useState(false);
  const { data: systemSettings } = useSystemSettings();

  // Load saved currency from localStorage or use system default
  useEffect(() => {
    try {
      const savedCurrency = localStorage.getItem('selected_currency');
      if (savedCurrency) {
        const found = SUPPORTED_CURRENCIES.find(c => c.code === savedCurrency);
        if (found) {
          setCurrencyState(found);
        }
      } else if (systemSettings?.default_currency) {
        // Use system default currency if no user preference
        const defaultCurrency = SUPPORTED_CURRENCIES.find(c => c.code === systemSettings.default_currency);
        if (defaultCurrency) {
          setCurrencyState(defaultCurrency);
        }
      }
    } catch (error) {
      console.error('Error loading saved currency:', error);
    } finally {
      setIsInitialized(true);
    }
  }, [systemSettings]);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    try {
      localStorage.setItem('selected_currency', newCurrency.code);
    } catch (error) {
      console.error('Error saving currency to localStorage:', error);
    }
  };

  const convertPrice = (price: number, fromCurrency: string = 'KES'): number => {
    if (fromCurrency === currency.code) {
      return price;
    }

    const rate = EXCHANGE_RATES[fromCurrency]?.[currency.code] || 1;
    return price * rate;
  };

  const formatPrice = (price: number, fromCurrency: string = 'KES'): string => {
    const convertedPrice = convertPrice(price, fromCurrency);
    return `${currency.symbol} ${convertedPrice.toLocaleString(undefined, {
      minimumFractionDigits: currency.decimal_digits,
      maximumFractionDigits: currency.decimal_digits
    })}`;
  };

  const value = {
    currency,
    setCurrency,
    convertPrice,
    formatPrice,
    exchangeRates: EXCHANGE_RATES
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    console.error('useCurrency must be used within a CurrencyProvider');
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};