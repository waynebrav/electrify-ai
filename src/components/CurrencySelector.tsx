import React from 'react';
import { Globe } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCurrency, SUPPORTED_CURRENCIES } from '@/context/CurrencyContext';

const CurrencySelector: React.FC = () => {
  const { currency, setCurrency } = useCurrency();

  const handleCurrencyChange = (currencyCode: string) => {
    const selectedCurrency = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode);
    if (selectedCurrency) {
      setCurrency(selectedCurrency);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <Select value={currency.code} onValueChange={handleCurrencyChange}>
        <SelectTrigger className="w-auto border-none bg-transparent px-2 py-1 h-auto text-sm">
          <SelectValue>
            <span className="flex items-center gap-1">
              <span className="font-medium">{currency.symbol}</span>
              <span className="text-muted-foreground">{currency.code}</span>
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-background border shadow-lg z-50">
          {SUPPORTED_CURRENCIES.map((curr) => (
            <SelectItem key={curr.code} value={curr.code} className="cursor-pointer">
              <div className="flex items-center gap-2">
                <span className="font-medium">{curr.symbol}</span>
                <span className="text-sm">{curr.code}</span>
                <span className="text-xs text-muted-foreground">({curr.name})</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CurrencySelector;