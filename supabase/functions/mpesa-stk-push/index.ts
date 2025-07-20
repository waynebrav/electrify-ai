import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phoneNumber, amount, orderId } = await req.json();

    if (!phoneNumber || !amount || !orderId) {
      throw new Error('Missing required parameters');
    }

    // Format phone number (remove + and ensure starts with 254)
    let formattedPhone = phoneNumber.replace(/[^0-9]/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith('254')) {
      formattedPhone = '254' + formattedPhone;
    }

    console.log('Initiating M-Pesa STK Push for:', { formattedPhone, amount, orderId });

    // Generate timestamp
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '');
    
    // M-Pesa credentials (these would be stored in Supabase secrets in production)
    const consumerKey = Deno.env.get('MPESA_CONSUMER_KEY');
    const consumerSecret = Deno.env.get('MPESA_CONSUMER_SECRET');
    const businessShortCode = Deno.env.get('MPESA_SHORTCODE') || '174379';
    const passkey = Deno.env.get('MPESA_PASSKEY');
    
    if (!consumerKey || !consumerSecret || !passkey) {
      // For demo purposes, return a mock success response
      console.log('M-Pesa credentials not configured, returning mock response');
      return new Response(JSON.stringify({
        success: true,
        message: 'STK Push initiated successfully (Demo Mode)',
        checkoutRequestId: 'demo_' + Date.now(),
        merchantRequestId: 'demo_merchant_' + Date.now()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Get OAuth token
    const authString = btoa(`${consumerKey}:${consumerSecret}`);
    const authResponse = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${authString}`,
      },
    });

    if (!authResponse.ok) {
      throw new Error('Failed to get M-Pesa OAuth token');
    }

    const authData = await authResponse.json();
    const accessToken = authData.access_token;

    // Generate password
    const password = btoa(`${businessShortCode}${passkey}${timestamp}`);

    // Initiate STK Push
    const stkPushResponse = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        BusinessShortCode: businessShortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(amount),
        PartyA: formattedPhone,
        PartyB: businessShortCode,
        PhoneNumber: formattedPhone,
        CallBackURL: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mpesa-callback`,
        AccountReference: `ORDER_${orderId}`,
        TransactionDesc: `Payment for Order ${orderId}`,
      }),
    });

    const stkData = await stkPushResponse.json();
    console.log('M-Pesa STK Push response:', stkData);

    if (stkData.ResponseCode === '0') {
      return new Response(JSON.stringify({
        success: true,
        message: 'STK Push initiated successfully',
        checkoutRequestId: stkData.CheckoutRequestID,
        merchantRequestId: stkData.MerchantRequestID
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } else {
      throw new Error(stkData.ResponseDescription || 'STK Push failed');
    }

  } catch (error) {
    console.error('M-Pesa STK Push error:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});