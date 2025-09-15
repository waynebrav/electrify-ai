import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const paypalClientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('PayPal execute payment function called');
    
    const url = new URL(req.url);
    const paymentId = url.searchParams.get('paymentId');
    const payerId = url.searchParams.get('PayerID');
    const success = url.searchParams.get('success');

    console.log('PayPal execution params:', { paymentId, payerId, success });

    // If payment was cancelled
    if (success === 'false' || !paymentId || !payerId) {
      console.log('PayPal payment cancelled or missing parameters');
      
      // Update transaction status if payment ID exists
      if (paymentId) {
        await supabase
          .from('payment_transactions')
          .update({ 
            status: 'cancelled',
            verification_status: 'failed',
            verification_notes: 'Payment cancelled by user'
          })
          .eq('transaction_reference', paymentId);
      }

      // Redirect to a cancellation page or order page with error
      const redirectUrl = `${Deno.env.get('SUPABASE_URL')}/order-confirmation?status=cancelled`;
      return new Response(null, {
        status: 302,
        headers: {
          'Location': redirectUrl,
          ...corsHeaders
        },
      });
    }

    // Get active PayPal configuration
    const { data: paypalConfig, error: configError } = await supabase
      .from('paypal_configurations')
      .select('*')
      .eq('is_active', true)
      .single();

    if (configError || !paypalConfig) {
      console.error('PayPal configuration error:', configError);
      throw new Error('No active PayPal configuration found');
    }

    if (!paypalClientSecret) {
      console.error('PayPal client secret not configured');
      throw new Error('PayPal client secret not configured');
    }

    // Get PayPal access token
    const tokenUrl = paypalConfig.environment === 'production' 
      ? 'https://api.paypal.com/v1/oauth2/token'
      : 'https://api.sandbox.paypal.com/v1/oauth2/token';

    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'en_US',
        'Authorization': `Basic ${btoa(`${paypalConfig.client_id}:${paypalClientSecret}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('PayPal token error:', errorText);
      throw new Error('Failed to get PayPal access token');
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Execute PayPal payment
    const executeUrl = paypalConfig.environment === 'production'
      ? `https://api.paypal.com/v1/payments/payment/${paymentId}/execute`
      : `https://api.sandbox.paypal.com/v1/payments/payment/${paymentId}/execute`;

    const executeResponse = await fetch(executeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        payer_id: payerId
      }),
    });

    if (!executeResponse.ok) {
      const errorText = await executeResponse.text();
      console.error('PayPal execution error:', errorText);
      throw new Error('Failed to execute PayPal payment');
    }

    const executedPayment = await executeResponse.json();
    console.log('PayPal payment executed successfully:', executedPayment.id);

    // Get order ID from the payment
    const orderId = executedPayment.transactions?.[0]?.custom;
    const transaction = executedPayment.transactions?.[0];
    const payer = executedPayment.payer;

    console.log('Processing payment for order:', orderId);

    // Update payment transaction
    const { error: transactionUpdateError } = await supabase
      .from('payment_transactions')
      .update({
        status: 'completed',
        verification_status: 'verified',
        payment_date: new Date().toISOString(),
        verification_notes: 'PayPal payment completed successfully',
        metadata: {
          paypal_payment_id: executedPayment.id,
          payer_info: payer?.payer_info,
          transaction_details: transaction,
          environment: paypalConfig.environment
        }
      })
      .eq('transaction_reference', paymentId);

    if (transactionUpdateError) {
      console.error('Error updating payment transaction:', transactionUpdateError);
    }

    // Update order status
    if (orderId) {
      const { error: orderUpdateError } = await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          status: 'processing'
        })
        .eq('id', orderId);

      if (orderUpdateError) {
        console.error('Error updating order:', orderUpdateError);
      }
    }

    console.log('PayPal payment processed successfully');

    // Redirect to success page
    const redirectUrl = orderId 
      ? `${Deno.env.get('SUPABASE_URL')}/order-confirmation/${orderId}?status=success&method=paypal`
      : `${Deno.env.get('SUPABASE_URL')}/order-confirmation?status=success&method=paypal`;
      
    return new Response(null, {
      status: 302,
      headers: {
        'Location': redirectUrl,
        ...corsHeaders
      },
    });

  } catch (error) {
    console.error('Error in PayPal execute payment function:', error);
    
    // Redirect to error page
    const redirectUrl = `${Deno.env.get('SUPABASE_URL')}/order-confirmation?status=error&error=${encodeURIComponent(error.message)}`;
    return new Response(null, {
      status: 302,
      headers: {
        'Location': redirectUrl,
        ...corsHeaders
      },
    });
  }
});