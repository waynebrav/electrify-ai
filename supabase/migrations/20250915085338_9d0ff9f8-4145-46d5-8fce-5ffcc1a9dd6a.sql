-- Add PayPal configuration table
CREATE TABLE IF NOT EXISTS public.paypal_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  client_id TEXT NOT NULL,
  environment TEXT NOT NULL CHECK (environment IN ('sandbox', 'production')),
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.paypal_configurations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage PayPal configurations" 
ON public.paypal_configurations 
FOR ALL 
USING (is_admin(auth.uid()));

CREATE POLICY "Anyone can view active PayPal configurations" 
ON public.paypal_configurations 
FOR SELECT 
USING (is_active = true OR is_admin(auth.uid()));

-- Add trigger for timestamp updates
CREATE TRIGGER update_paypal_configurations_updated_at
BEFORE UPDATE ON public.paypal_configurations
FOR EACH ROW
EXECUTE FUNCTION public.update_timestamp();

-- Insert default PayPal configuration
INSERT INTO public.paypal_configurations (name, client_id, environment, is_active)
VALUES ('Default PayPal', 'demo-client-id', 'sandbox', true)
ON CONFLICT DO NOTHING;