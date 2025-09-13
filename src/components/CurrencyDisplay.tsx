import React from 'react';
import { useCurrency } from '@/context/CurrencyContext';
import { useSystemSettings } from '@/hooks/useSystemSettings';

interface CurrencyDisplayProps {
  amount: number;
  fromCurrency?: string;
  className?: string;
}

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({ 
  amount, 
  fromCurrency = 'KES', 
  className = '' 
}) => {
  const { formatPrice } = useCurrency();
  const { data: systemSettings } = useSystemSettings();

  // Apply tax if enabled in system settings
  let finalAmount = amount;
  if (systemSettings?.tax_rate && systemSettings.tax_rate > 0) {
    finalAmount = amount * (1 + systemSettings.tax_rate / 100);
  }

  return (
    <span className={className}>
      {formatPrice(finalAmount, fromCurrency)}
    </span>
  );
};

interface FreeShippingThresholdProps {
  currentAmount: number;
  className?: string;
}

export const FreeShippingThreshold: React.FC<FreeShippingThresholdProps> = ({
  currentAmount,
  className = ''
}) => {
  const { formatPrice } = useCurrency();
  const { data: systemSettings } = useSystemSettings();

  if (!systemSettings?.free_shipping_threshold) return null;

  const remaining = systemSettings.free_shipping_threshold - currentAmount;

  if (remaining <= 0) {
    return (
      <div className={`text-green-600 ${className}`}>
        🎉 You qualify for free shipping!
      </div>
    );
  }

  return (
    <div className={`text-muted-foreground ${className}`}>
      Add {formatPrice(remaining)} more for free shipping
    </div>
  );
};