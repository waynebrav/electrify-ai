-- Create M-Pesa configurations table
CREATE TABLE IF NOT EXISTS public.mpesa_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  shortcode TEXT NOT NULL,
  environment TEXT NOT NULL CHECK (environment IN ('sandbox', 'production')),
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.mpesa_configurations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage M-Pesa configurations" 
ON public.mpesa_configurations 
FOR ALL 
USING (is_admin(auth.uid()));

CREATE POLICY "Anyone can view active M-Pesa configurations" 
ON public.mpesa_configurations 
FOR SELECT 
USING (is_active = true OR is_admin(auth.uid()));

-- Create trigger for timestamp updates
CREATE TRIGGER update_mpesa_configurations_updated_at
BEFORE UPDATE ON public.mpesa_configurations
FOR EACH ROW
EXECUTE FUNCTION public.update_timestamp();

-- Insert default configuration
INSERT INTO public.mpesa_configurations (
  name,
  shortcode,
  environment,
  is_active
) VALUES (
  'Default M-Pesa Sandbox',
  '174379',
  'sandbox',
  true
) ON CONFLICT DO NOTHING;