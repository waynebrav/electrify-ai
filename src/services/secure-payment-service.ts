// Secure payment service with proper credential handling
import { supabase } from '@/integrations/supabase/client';

interface PaymentConfig {
  mpesaConsumerKey?: string;
  mpesaConsumerSecret?: string;
  mpesaShortcode?: string;
  mpesaPasskey?: string;
  environment: 'sandbox' | 'production';
}

export class SecurePaymentService {
  private config: PaymentConfig | null = null;

  async initializePayment(): Promise<PaymentConfig> {
    if (this.config) return this.config;

    try {
      // In production, payment configuration should come from Supabase secrets
      // For now, using secure environment-like defaults
      const settings = {
        mpesa_consumer_key: process.env.MPESA_CONSUMER_KEY || '',
        mpesa_consumer_secret: process.env.MPESA_CONSUMER_SECRET || '',
        mpesa_shortcode: process.env.MPESA_SHORTCODE || '',
        mpesa_passkey: process.env.MPESA_PASSKEY || '',
        payment_environment: process.env.PAYMENT_ENVIRONMENT || 'sandbox'
      };

      this.config = {
        mpesaConsumerKey: settings.mpesa_consumer_key,
        mpesaConsumerSecret: settings.mpesa_consumer_secret,
        mpesaShortcode: settings.mpesa_shortcode,
        mpesaPasskey: settings.mpesa_passkey,
        environment: (settings.payment_environment as 'sandbox' | 'production') || 'sandbox'
      };

      return this.config;
    } catch (error) {
      console.error('Failed to initialize payment configuration:', error);
      throw new Error('Payment system configuration error');
    }
  }

  async processPayment(amount: number, phoneNumber: string, orderId: string) {
    const config = await this.initializePayment();
    
    if (!config.mpesaConsumerKey || !config.mpesaConsumerSecret) {
      throw new Error('Payment system not properly configured');
    }

    // Call secure edge function for payment processing
    const { data, error } = await supabase.functions.invoke('mpesa-stk-push', {
      body: {
        amount,
        phoneNumber,
        orderId,
        environment: config.environment
      }
    });

    if (error) throw error;
    return data;
  }

  clearConfig() {
    this.config = null;
  }
}

export const securePaymentService = new SecurePaymentService();