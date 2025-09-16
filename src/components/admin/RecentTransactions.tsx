import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CreditCard, Smartphone, Wallet } from 'lucide-react';
import { CurrencyDisplay } from '@/components/CurrencyDisplay';

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  payment_method_code: string;
  status: string;
  verification_status: string;
  created_at: string;
  orders: {
    id: string;
    user_id: string;
  } | null;
}

export const RecentTransactions = () => {
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['recent-transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_transactions')
        .select(`
          id,
          amount,
          currency,
          payment_method_code,
          status,
          verification_status,
          created_at,
          orders (
            id,
            user_id
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as Transaction[];
    },
  });

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'mpesa':
        return <Smartphone className="h-4 w-4" />;
      case 'paypal':
        return <Wallet className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string, verificationStatus: string) => {
    if (status === 'completed' && verificationStatus === 'verified') {
      return 'default';
    } else if (status === 'pending') {
      return 'secondary';
    } else {
      return 'destructive';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
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
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions?.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center space-x-3">
                {getPaymentMethodIcon(transaction.payment_method_code)}
                <div>
                  <p className="font-medium">
                    {transaction.payment_method_code.toUpperCase()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Order #{transaction.orders?.id?.substring(0, 8)}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <CurrencyDisplay
                    amount={transaction.amount}
                    fromCurrency={transaction.currency}
                    className="font-medium"
                  />
                  <Badge
                    variant={getStatusColor(transaction.status, transaction.verification_status)}
                  >
                    {transaction.status === 'completed' && transaction.verification_status === 'verified'
                      ? 'Verified'
                      : transaction.status === 'pending'
                      ? 'Pending'
                      : 'Failed'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {new Date(transaction.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
          
          {!transactions?.length && (
            <div className="text-center py-8 text-muted-foreground">
              No recent transactions found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};