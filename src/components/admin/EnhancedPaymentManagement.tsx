import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, 
  Search, 
  Filter, 
  Download, 
  Eye,
  RefreshCw,
  TrendingUp,
  DollarSign,
  CreditCard,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  MoreHorizontal,
  ArrowUpDown
} from 'lucide-react';
import { CurrencyDisplay } from '@/components/CurrencyDisplay';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface PaymentTransaction {
  id: string;
  amount: number;
  currency: string;
  payment_method_code: string;
  status: string;
  verification_status: string;
  created_at: string;
  phone_number?: string;
  mpesa_receipt_number?: string;
  transaction_reference?: string;
  orders: {
    id: string;
    user_id: string;
    status: string;
  } | null;
}

interface PaymentAnalytics {
  totalRevenue: number;
  totalTransactions: number;
  successfulTransactions: number;
  pendingTransactions: number;
  failedTransactions: number;
  averageTransactionValue: number;
  topPaymentMethod: string;
}

export const EnhancedPaymentManagement = () => {
  const [selectedTransaction, setSelectedTransaction] = useState<PaymentTransaction | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    paymentMethod: 'all',
    dateRange: '7d',
    search: ''
  });
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch payment transactions
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['payment-transactions', filters, sortBy, sortOrder],
    queryFn: async () => {
      let query = supabase
        .from('payment_transactions')
        .select(`
          id,
          amount,
          currency,
          payment_method_code,
          status,
          verification_status,
          created_at,
          phone_number,
          mpesa_receipt_number,
          transaction_reference,
          metadata,
          orders (
            id,
            user_id,
            status
          )
        `);

      // Apply filters
      if (filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      
      if (filters.paymentMethod !== 'all') {
        query = query.eq('payment_method_code', filters.paymentMethod);
      }
      
      if (filters.search) {
        query = query.or(`payment_method_code.ilike.%${filters.search}%,mpesa_receipt_number.ilike.%${filters.search}%,transaction_reference.ilike.%${filters.search}%`);
      }

      // Apply date range
      if (filters.dateRange !== 'all') {
        const now = new Date();
        const days = parseInt(filters.dateRange.replace('d', ''));
        const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        query = query.gte('created_at', startDate.toISOString());
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const { data, error } = await query.limit(100);
      if (error) throw error;
      return data as PaymentTransaction[];
    },
  });

  // Calculate analytics
  const analytics = useMemo<PaymentAnalytics>(() => {
    if (!transactions) {
      return {
        totalRevenue: 0,
        totalTransactions: 0,
        successfulTransactions: 0,
        pendingTransactions: 0,
        failedTransactions: 0,
        averageTransactionValue: 0,
        topPaymentMethod: 'N/A'
      };
    }

    const successful = transactions.filter(t => t.status === 'completed' && t.verification_status === 'verified');
    const pending = transactions.filter(t => t.status === 'pending');
    const failed = transactions.filter(t => t.status === 'failed');
    
    const totalRevenue = successful.reduce((sum, t) => sum + t.amount, 0);
    const averageTransactionValue = successful.length > 0 ? totalRevenue / successful.length : 0;

    // Find top payment method
    const methodCounts = transactions.reduce((acc, t) => {
      acc[t.payment_method_code] = (acc[t.payment_method_code] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topPaymentMethod = Object.entries(methodCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

    return {
      totalRevenue,
      totalTransactions: transactions.length,
      successfulTransactions: successful.length,
      pendingTransactions: pending.length,
      failedTransactions: failed.length,
      averageTransactionValue,
      topPaymentMethod
    };
  }, [transactions]);

  // Mutation for refunding transactions
  const refundMutation = useMutation({
    mutationFn: async (transactionId: string) => {
      const { error } = await supabase
        .from('payment_transactions')
        .update({ 
          status: 'refunded',
          verification_status: 'refunded',
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Refund Successful",
        description: "Transaction has been marked as refunded",
      });
      queryClient.invalidateQueries({ queryKey: ['payment-transactions'] });
    },
    onError: () => {
      toast({
        title: "Refund Failed",
        description: "Could not process refund",
        variant: "destructive",
      });
    },
  });

  const getStatusIcon = (status: string, verificationStatus: string) => {
    if (status === 'completed' && verificationStatus === 'verified') {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (status === 'pending') {
      return <Clock className="h-4 w-4 text-yellow-500" />;
    } else if (status === 'failed') {
      return <XCircle className="h-4 w-4 text-red-500" />;
    } else if (status === 'refunded') {
      return <RefreshCw className="h-4 w-4 text-blue-500" />;
    }
    return <AlertCircle className="h-4 w-4 text-gray-500" />;
  };

  const getStatusBadge = (status: string, verificationStatus: string) => {
    if (status === 'completed' && verificationStatus === 'verified') {
      return <Badge variant="default" className="bg-green-500">Verified</Badge>;
    } else if (status === 'pending') {
      return <Badge variant="secondary">Pending</Badge>;
    } else if (status === 'failed') {
      return <Badge variant="destructive">Failed</Badge>;
    } else if (status === 'refunded') {
      return <Badge variant="outline" className="border-blue-500 text-blue-500">Refunded</Badge>;
    }
    return <Badge variant="outline">Unknown</Badge>;
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleExport = () => {
    if (!transactions) return;
    
    const csv = [
      ['Date', 'Transaction ID', 'Amount', 'Currency', 'Payment Method', 'Status', 'Order ID', 'Phone Number', 'Receipt Number'].join(','),
      ...transactions.map(t => [
        format(new Date(t.created_at), 'yyyy-MM-dd HH:mm:ss'),
        t.id,
        t.amount,
        t.currency,
        t.payment_method_code,
        `${t.status}/${t.verification_status}`,
        t.orders?.id || 'N/A',
        t.phone_number || 'N/A',
        t.mpesa_receipt_number || t.transaction_reference || 'N/A'
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">
                  <CurrencyDisplay amount={analytics.totalRevenue} />
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-2">
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                {analytics.successfulTransactions} successful
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Transactions</p>
                <p className="text-2xl font-bold">{analytics.totalTransactions}</p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-2">
              <div className="flex items-center text-xs text-blue-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                {analytics.successfulTransactions} completed
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Value</p>
                <p className="text-2xl font-bold">
                  <CurrencyDisplay amount={analytics.averageTransactionValue} />
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
            <div className="mt-2">
              <div className="flex items-center text-xs text-purple-600">
                <ArrowUpDown className="h-3 w-3 mr-1" />
                Per transaction
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Top Method</p>
                <p className="text-2xl font-bold uppercase">{analytics.topPaymentMethod}</p>
              </div>
              <CreditCard className="h-8 w-8 text-orange-500" />
            </div>
            <div className="mt-2">
              <div className="flex gap-1">
                <Badge variant="outline" className="text-xs">
                  {analytics.pendingTransactions} pending
                </Badge>
                <Badge variant="destructive" className="text-xs">
                  {analytics.failedTransactions} failed
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Transactions</CardTitle>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-0">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-8"
                />
              </div>
            </div>

            <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.paymentMethod} onValueChange={(value) => setFilters(prev => ({ ...prev, paymentMethod: value }))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="mpesa">M-Pesa</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="bitcoin">Bitcoin</SelectItem>
                <SelectItem value="ethereum">Ethereum</SelectItem>
                <SelectItem value="usdt">USDT</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.dateRange} onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">1 Day</SelectItem>
                <SelectItem value="7d">7 Days</SelectItem>
                <SelectItem value="30d">30 Days</SelectItem>
                <SelectItem value="90d">90 Days</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {transactionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 cursor-pointer" onClick={() => handleSort('created_at')}>
                      <div className="flex items-center">
                        Date
                        <ArrowUpDown className="h-3 w-3 ml-1" />
                      </div>
                    </th>
                    <th className="text-left p-2 cursor-pointer" onClick={() => handleSort('amount')}>
                      <div className="flex items-center">
                        Amount
                        <ArrowUpDown className="h-3 w-3 ml-1" />
                      </div>
                    </th>
                    <th className="text-left p-2">Method</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Reference</th>
                    <th className="text-left p-2">Order</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions?.map((transaction) => (
                    <tr key={transaction.id} className="border-b hover:bg-muted/50">
                      <td className="p-2">
                        <div className="text-sm">
                          {format(new Date(transaction.created_at), 'MMM dd, yyyy')}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(transaction.created_at), 'HH:mm:ss')}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="font-medium">
                          <CurrencyDisplay amount={transaction.amount} fromCurrency={transaction.currency} />
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center">
                          {getStatusIcon(transaction.status, transaction.verification_status)}
                          <span className="ml-2 uppercase text-sm font-medium">
                            {transaction.payment_method_code}
                          </span>
                        </div>
                        {transaction.phone_number && (
                          <div className="text-xs text-muted-foreground">
                            {transaction.phone_number}
                          </div>
                        )}
                      </td>
                      <td className="p-2">
                        {getStatusBadge(transaction.status, transaction.verification_status)}
                      </td>
                      <td className="p-2">
                        <div className="text-sm font-mono">
                          {transaction.mpesa_receipt_number || transaction.transaction_reference || 'N/A'}
                        </div>
                      </td>
                      <td className="p-2">
                        {transaction.orders && (
                          <div className="text-sm">
                            <div className="font-mono">#{transaction.orders.id.substring(0, 8)}</div>
                            <Badge variant="outline" className="text-xs">
                              {transaction.orders.status}
                            </Badge>
                          </div>
                        )}
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedTransaction(transaction)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Transaction Details</DialogTitle>
                              </DialogHeader>
                              {selectedTransaction && (
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-semibold mb-2">Transaction Info</h4>
                                    <div className="space-y-1 text-sm">
                                      <div><span className="font-medium">ID:</span> {selectedTransaction.id}</div>
                                      <div><span className="font-medium">Amount:</span> <CurrencyDisplay amount={selectedTransaction.amount} fromCurrency={selectedTransaction.currency} /></div>
                                      <div><span className="font-medium">Method:</span> {selectedTransaction.payment_method_code.toUpperCase()}</div>
                                      <div><span className="font-medium">Status:</span> {getStatusBadge(selectedTransaction.status, selectedTransaction.verification_status)}</div>
                                      <div><span className="font-medium">Created:</span> {format(new Date(selectedTransaction.created_at), 'PPpp')}</div>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold mb-2">Payment Details</h4>
                                    <div className="space-y-1 text-sm">
                                      {selectedTransaction.phone_number && (
                                        <div><span className="font-medium">Phone:</span> {selectedTransaction.phone_number}</div>
                                      )}
                                      {selectedTransaction.mpesa_receipt_number && (
                                        <div><span className="font-medium">M-Pesa Receipt:</span> {selectedTransaction.mpesa_receipt_number}</div>
                                      )}
                                      {selectedTransaction.transaction_reference && (
                                        <div><span className="font-medium">Reference:</span> {selectedTransaction.transaction_reference}</div>
                                      )}
                                      {selectedTransaction.orders && (
                                        <div><span className="font-medium">Order:</span> #{selectedTransaction.orders.id}</div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          {transaction.status === 'completed' && transaction.verification_status === 'verified' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => refundMutation.mutate(transaction.id)}
                              disabled={refundMutation.isPending}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {!transactions?.length && (
                <div className="text-center py-8 text-muted-foreground">
                  No transactions found matching your criteria
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};