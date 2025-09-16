import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useCurrency } from '@/context/CurrencyContext';
import { Loader2, DollarSign } from 'lucide-react';

export const CurrencySettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currency: currentCurrency, setCurrency } = useCurrency();
  const [exchangeRateInput, setExchangeRateInput] = useState<{ [key: string]: string }>({});

  const { data: settings, isLoading } = useQuery({
    queryKey: ['currency-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('key, value')
        .in('key', ['default_currency']);

      if (error) throw error;

      const settingsMap: Record<string, any> = {};
      data?.forEach(setting => {
        settingsMap[setting.key] = setting.value;
      });

      return {
        default_currency: settingsMap.default_currency || 'KES'
      };
    },
  });

  const updateCurrencySettings = useMutation({
    mutationFn: async (currency: string) => {
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          key: 'default_currency',
          value: currency,
          type: 'string'
        });

      if (error) throw error;
      return currency;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Currency settings updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['currency-settings'] });
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update currency settings',
        variant: 'destructive',
      });
      console.error('Currency settings update error:', error);
    },
  });

  const handleDefaultCurrencyChange = (currency: string) => {
    updateCurrencySettings.mutate(currency);
  };

  const currencies = [
    { code: 'KES', name: 'Kenyan Shilling', symbol: 'KES' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' }
  ];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Currency Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Currency Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <Label htmlFor="default-currency">Default Currency</Label>
            <Select
              value={settings?.default_currency}
              onValueChange={handleDefaultCurrencyChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select default currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.name} ({currency.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-1">
              This will be the default currency for all products and transactions. All products are stored in this currency.
            </p>
          </div>

          <div>
            <Label>Current Display Currency</Label>
            <Select
              value={currentCurrency.code}
              onValueChange={(value) => {
                const selectedCurrency = currencies.find(c => c.code === value);
                if (selectedCurrency) {
                  setCurrency({
                    code: selectedCurrency.code,
                    symbol: selectedCurrency.symbol,
                    name: selectedCurrency.name,
                    decimal_digits: 2,
                    rounding: 0
                  });
                }
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.name} ({currency.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-1">
              This affects how prices are displayed to you. Conversion rates are automatically calculated.
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Currency Conversion</h4>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Products are stored in {settings?.default_currency || 'KES'} and converted automatically for display. 
              Exchange rates are fetched in real-time for accurate pricing.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};