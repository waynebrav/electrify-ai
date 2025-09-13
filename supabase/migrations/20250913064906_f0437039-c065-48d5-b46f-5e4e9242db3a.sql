-- Add flash sale discount percentage to products table
ALTER TABLE public.products 
ADD COLUMN flash_sale_discount_percentage integer DEFAULT 0;

-- Add flash sale category and time slot
ALTER TABLE public.products 
ADD COLUMN flash_sale_category text,
ADD COLUMN flash_sale_time_slot text;

-- Add banned status to profiles table
ALTER TABLE public.profiles 
ADD COLUMN is_banned boolean DEFAULT false,
ADD COLUMN ban_reason text,
ADD COLUMN banned_at timestamp with time zone,
ADD COLUMN banned_by uuid;

-- Create system_settings table
CREATE TABLE IF NOT EXISTS public.system_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value text NOT NULL,
  type text NOT NULL DEFAULT 'text',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on system_settings
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for system_settings
CREATE POLICY "Admins can manage system settings" 
ON public.system_settings 
FOR ALL 
USING (is_admin(auth.uid()));

CREATE POLICY "Anyone can view system settings" 
ON public.system_settings 
FOR SELECT 
USING (true);

-- Insert default system settings
INSERT INTO public.system_settings (key, value, type) VALUES
('site_name', 'Electrify', 'text'),
('site_email', 'support@electrify.com', 'text'),
('default_currency', 'KES', 'text'),
('tax_rate', '16', 'number'),
('free_shipping_threshold', '5000', 'number'),
('enable_guest_checkout', 'true', 'boolean'),
('enable_reviews', 'true', 'boolean'),
('enable_wishlist', 'true', 'boolean'),
('max_cart_items', '50', 'number'),
('enable_inventory_tracking', 'true', 'boolean')
ON CONFLICT (key) DO NOTHING;

-- Create trigger for system_settings timestamp
CREATE TRIGGER set_timestamp_system_settings
BEFORE UPDATE ON public.system_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_timestamp();

-- Update profiles policies to handle banned users
CREATE POLICY "Banned users cannot access system" 
ON public.profiles 
FOR SELECT 
USING (NOT is_banned OR is_admin(auth.uid()));