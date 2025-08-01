-- Fix RLS issues by enabling RLS on tables that have policies but RLS disabled
ALTER TABLE public.product_status ENABLE ROW LEVEL SECURITY;

-- Add missing RLS policies for product_status table
CREATE POLICY "Anyone can view product statuses" 
ON public.product_status 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage product statuses" 
ON public.product_status 
FOR ALL 
USING (is_admin(auth.uid()));

-- Fix function search paths
CREATE OR REPLACE FUNCTION public.is_vendor(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = $1 AND ur.role = 'vendor'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = $1 AND ur.role = 'admin'
  );
$$;

-- Add video_url and model_3d_url columns to products table if they don't exist
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS video_url text,
ADD COLUMN IF NOT EXISTS image_url text;

-- Update products table to ensure all currencies are KES
UPDATE public.products SET currency = 'KES' WHERE currency != 'KES';
UPDATE public.orders SET currency = 'KES' WHERE currency != 'KES';
UPDATE public.coupons SET currency = 'KES' WHERE currency != 'KES';
UPDATE public.payment_transactions SET currency = 'KES' WHERE currency != 'KES';

-- Create a real analytics data population function
CREATE OR REPLACE FUNCTION public.populate_admin_analytics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    start_date date := CURRENT_DATE - INTERVAL '30 days';
    end_date date := CURRENT_DATE;
    current_date date;
    daily_users int;
    daily_revenue numeric;
    daily_orders int;
    daily_products int;
BEGIN
    -- Clear existing analytics data for the last 30 days
    DELETE FROM public.admin_analytics 
    WHERE date >= start_date AND date <= end_date;
    
    -- Generate analytics for each day in the last 30 days
    current_date := start_date;
    WHILE current_date <= end_date LOOP
        -- Count users created up to this date
        SELECT COUNT(*) INTO daily_users
        FROM auth.users 
        WHERE DATE(created_at) <= current_date;
        
        -- Calculate revenue for orders up to this date
        SELECT COALESCE(SUM(total_amount), 0) INTO daily_revenue
        FROM public.orders 
        WHERE DATE(created_at) <= current_date 
        AND payment_status = 'paid';
        
        -- Count orders up to this date
        SELECT COUNT(*) INTO daily_orders
        FROM public.orders 
        WHERE DATE(created_at) <= current_date
        AND status IN ('completed', 'processing');
        
        -- Count active products up to this date
        SELECT COUNT(*) INTO daily_products
        FROM public.products 
        WHERE DATE(created_at) <= current_date
        AND status = 'Active';
        
        -- Insert analytics record
        INSERT INTO public.admin_analytics (
            date, 
            total_users, 
            total_revenue, 
            orders_count, 
            active_products
        ) VALUES (
            current_date,
            daily_users,
            daily_revenue,
            daily_orders,
            daily_products
        );
        
        current_date := current_date + INTERVAL '1 day';
    END LOOP;
END;
$$;

-- Execute the function to populate real analytics data
SELECT public.populate_admin_analytics();