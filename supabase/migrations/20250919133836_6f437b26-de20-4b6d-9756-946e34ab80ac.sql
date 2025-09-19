-- Add transaction tracking columns and improve transaction status recording
ALTER TABLE payment_transactions 
ADD COLUMN IF NOT EXISTS transaction_id TEXT,
ADD COLUMN IF NOT EXISTS callback_data JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP WITH TIME ZONE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status, verification_status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON payment_transactions(created_at DESC);

-- Create trigger to automatically update orders when payment is verified
CREATE OR REPLACE FUNCTION update_order_payment_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update order status when payment is completed and verified
  IF NEW.status = 'completed' AND NEW.verification_status = 'verified' AND (OLD.status != 'completed' OR OLD.verification_status != 'verified') THEN
    UPDATE orders 
    SET 
      payment_status = 'paid',
      status = CASE 
        WHEN status = 'pending' THEN 'processing'
        ELSE status
      END,
      updated_at = NOW()
    WHERE id = NEW.order_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS trigger_update_order_payment_status ON payment_transactions;
CREATE TRIGGER trigger_update_order_payment_status
  AFTER UPDATE ON payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_order_payment_status();

-- Create function to record M-Pesa callback data
CREATE OR REPLACE FUNCTION record_mpesa_callback(
  p_transaction_id TEXT,
  p_callback_data JSONB,
  p_status TEXT DEFAULT 'completed',
  p_verification_status TEXT DEFAULT 'verified'
)
RETURNS BOOLEAN AS $$
DECLARE
  update_count INTEGER;
BEGIN
  -- Update transaction with callback data
  UPDATE payment_transactions 
  SET 
    transaction_id = p_transaction_id,
    callback_data = p_callback_data,
    status = p_status,
    verification_status = p_verification_status,
    processed_at = NOW(),
    updated_at = NOW()
  WHERE 
    payment_method_code = 'mpesa' 
    AND status = 'pending'
    AND (
      metadata->>'CheckoutRequestID' = p_callback_data->>'CheckoutRequestID' OR
      id::text = p_transaction_id
    );
  
  GET DIAGNOSTICS update_count = ROW_COUNT;
  
  RETURN update_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;