import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const callbackData = await req.json();
    console.log('M-Pesa callback received:', JSON.stringify(callbackData, null, 2));

    // Initialize Supabase client with service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const { Body } = callbackData;
    const { stkCallback } = Body;

    if (stkCallback.ResultCode === 0) {
      // Payment successful
      const { CallbackMetadata } = stkCallback;
      const items = CallbackMetadata.Item;

      // Extract payment details
      const amount = items.find((item: any) => item.Name === 'Amount')?.Value;
      const mpesaReceiptNumber = items.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value;
      const phoneNumber = items.find((item: any) => item.Name === 'PhoneNumber')?.Value;
      const transactionDate = items.find((item: any) => item.Name === 'TransactionDate')?.Value;

      // Extract order ID from account reference
      const accountReference = stkCallback.AccountReference;
      const orderId = accountReference.replace('ORDER_', '');

      console.log('Processing successful payment:', {
        orderId,
        amount,
        mpesaReceiptNumber,
        phoneNumber
      });

      // Update order status
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          status: 'processing',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (orderError) {
        console.error('Error updating order:', orderError);
      }

      // Create payment transaction record
      const { error: transactionError } = await supabase
        .from('payment_transactions')
        .insert({
          order_id: orderId,
          amount: amount,
          currency: 'KES',
          payment_method_code: 'mpesa',
          status: 'completed',
          mpesa_receipt_number: mpesaReceiptNumber,
          phone_number: phoneNumber.toString(),
          payment_date: new Date(transactionDate.toString()).toISOString(),
          verification_status: 'verified',
          verified_at: new Date().toISOString(),
          metadata: callbackData
        });

      if (transactionError) {
        console.error('Error creating transaction record:', transactionError);
      }

    } else {
      // Payment failed
      console.log('Payment failed:', stkCallback.ResultDesc);
      
      // You could update order status to failed here if needed
      // const orderId = stkCallback.AccountReference.replace('ORDER_', '');
      // await supabase.from('orders').update({ payment_status: 'failed' }).eq('id', orderId);
    }

    // Always return success to M-Pesa
    return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: 'Success' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('M-Pesa callback error:', error);
    
    // Still return success to M-Pesa to avoid retries
    return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: 'Success' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  }
});