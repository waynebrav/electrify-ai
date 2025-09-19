import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, CreditCard, Smartphone, Wallet, Search, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const ITEMS_PER_PAGE = 5;

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
        .order('created_at', { ascending: false });

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

  // Filter and paginate transactions
  const filteredTransactions = transactions?.filter(transaction => 
    transaction.payment_method_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.orders?.id?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const startIndex = currentPage * ITEMS_PER_PAGE;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);

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
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {paginatedTransactions.map((transaction) => (
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
          
          {!paginatedTransactions.length && !isLoading && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'No transactions match your search' : 'No recent transactions found'}
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredTransactions.length)} of {filteredTransactions.length}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage === totalPages - 1}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};