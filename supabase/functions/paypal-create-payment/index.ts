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
    console.log('PayPal create payment function called');
    
    const { orderId, amount, currency = 'USD' } = await req.json();
    
    if (!orderId || !amount) {
      throw new Error('Missing required fields: orderId, amount');
    }

    console.log('Processing PayPal payment for order:', orderId, 'amount:', amount);

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
      throw new Error('PayPal client secret not configured in Supabase secrets');
    }

    console.log('Using PayPal config:', paypalConfig.name, paypalConfig.environment);

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

    console.log('PayPal access token obtained successfully');

    // Create PayPal payment
    const paymentUrl = paypalConfig.environment === 'production'
      ? 'https://api.paypal.com/v1/payments/payment'
      : 'https://api.sandbox.paypal.com/v1/payments/payment';

    const paymentData = {
      intent: 'sale',
      payer: {
        payment_method: 'paypal'
      },
      transactions: [{
        amount: {
          total: amount.toString(),
          currency: currency
        },
        description: `Order ${orderId} payment`,
        custom: orderId // Store order ID for later reference
      }],
      redirect_urls: {
        return_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/paypal-execute-payment?success=true`,
        cancel_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/paypal-execute-payment?success=false`
      }
    };

    console.log('Creating PayPal payment with data:', JSON.stringify(paymentData, null, 2));

    const paymentResponse = await fetch(paymentUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(paymentData),
    });

    if (!paymentResponse.ok) {
      const errorText = await paymentResponse.text();
      console.error('PayPal payment creation error:', errorText);
      throw new Error('Failed to create PayPal payment');
    }

    const payment = await paymentResponse.json();
    console.log('PayPal payment created:', payment.id);

    // Find approval URL
    const approvalUrl = payment.links?.find((link: any) => link.rel === 'approval_url')?.href;
    
    if (!approvalUrl) {
      throw new Error('No approval URL found in PayPal response');
    }

    // Store payment transaction
    const { error: transactionError } = await supabase
      .from('payment_transactions')
      .insert({
        order_id: orderId,
        amount: parseFloat(amount),
        currency: currency,
        payment_method_code: 'paypal',
        status: 'pending',
        transaction_reference: payment.id,
        metadata: {
          paypal_payment_id: payment.id,
          approval_url: approvalUrl,
          environment: paypalConfig.environment
        }
      });

    if (transactionError) {
      console.error('Error storing payment transaction:', transactionError);
      // Don't fail the request, just log the error
    }

    console.log('PayPal payment created successfully, approval URL:', approvalUrl);

    return new Response(JSON.stringify({
      success: true,
      paymentId: payment.id,
      approvalUrl: approvalUrl,
      message: 'PayPal payment created successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in PayPal create payment function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Unknown error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});