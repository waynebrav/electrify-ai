-- Fix RLS policy for table with no policies
-- This should be the table that has RLS enabled but no policies

-- Add policies for any tables that might be missing them
-- First, let's add a policy for product_status if it doesn't have one
DO $$ 
BEGIN
    -- Check if product_status table exists and add policies if missing
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'product_status' AND table_schema = 'public') THEN
        -- Add select policy for everyone to view product status
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_status' AND policyname = 'Anyone can view product status') THEN
            EXECUTE 'CREATE POLICY "Anyone can view product status" ON public.product_status FOR SELECT USING (true)';
        END IF;
        
        -- Add admin management policy
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_status' AND policyname = 'Admins can manage product status') THEN
            EXECUTE 'CREATE POLICY "Admins can manage product status" ON public.product_status FOR ALL USING (is_admin(auth.uid()))';
        END IF;
    END IF;
END $$;

-- Fix function search paths for security
-- Update authenticate_admin function
DROP FUNCTION IF EXISTS public.authenticate_admin(text, text);
CREATE OR REPLACE FUNCTION public.authenticate_admin(admin_email text, admin_password text)
 RETURNS TABLE(id uuid, email text, first_name text, last_name text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.email,
    a.first_name,
    a.last_name
  FROM
    public.admins a
  WHERE
    lower(a.email) = lower(admin_email)
    AND crypt(admin_password, a.password_hash) = a.password_hash;
END;
$function$;

-- Update is_vendor function
DROP FUNCTION IF EXISTS public.is_vendor(uuid);
CREATE OR REPLACE FUNCTION public.is_vendor(user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = $1 AND ur.role = 'vendor'
  );
$function$;

-- Update is_admin function
DROP FUNCTION IF EXISTS public.is_admin(uuid);
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = $1 AND ur.role = 'admin'
  );
$function$;

-- Update get_admin_dashboard_stats function
DROP FUNCTION IF EXISTS public.get_admin_dashboard_stats();
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
 RETURNS TABLE(total_users integer, total_revenue numeric, orders_count integer, active_products integer, user_growth_percentage numeric, revenue_growth_percentage numeric, orders_growth_percentage numeric, products_growth_percentage numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  current_total_users INTEGER;
  current_total_revenue NUMERIC;
  current_orders_count INTEGER;
  current_active_products INTEGER;
  previous_total_users INTEGER;
  previous_total_revenue NUMERIC;
  previous_orders_count INTEGER;
  previous_active_products INTEGER;
BEGIN
  -- Get current stats from actual tables
  SELECT COUNT(*) INTO current_total_users FROM auth.users;
  
  SELECT COALESCE(SUM(o.total_amount), 0) INTO current_total_revenue 
  FROM public.orders o WHERE o.payment_status = 'paid';
  
  SELECT COUNT(*) INTO current_orders_count 
  FROM public.orders o WHERE o.status IN ('completed', 'processing');
  
  SELECT COUNT(*) INTO current_active_products 
  FROM public.products p WHERE p.status = 'Active';
  
  -- Get previous month stats (30 days ago) for comparison
  SELECT COUNT(*) INTO previous_total_users 
  FROM auth.users au 
  WHERE au.created_at <= NOW() - INTERVAL '30 days';
  
  SELECT COALESCE(SUM(o.total_amount), 0) INTO previous_total_revenue 
  FROM public.orders o 
  WHERE o.payment_status = 'paid' AND o.created_at <= NOW() - INTERVAL '30 days';
  
  SELECT COUNT(*) INTO previous_orders_count 
  FROM public.orders o 
  WHERE o.status IN ('completed', 'processing') AND o.created_at <= NOW() - INTERVAL '30 days';
  
  -- Use current product count as baseline (products don't have historical tracking)
  previous_active_products := current_active_products;
  
  -- Calculate growth percentages (avoid division by zero)
  RETURN QUERY SELECT
    current_total_users,
    current_total_revenue,
    current_orders_count,
    current_active_products,
    CASE 
      WHEN previous_total_users > 0 THEN 
        ROUND(((current_total_users - previous_total_users)::NUMERIC / previous_total_users * 100), 1)
      ELSE 0::NUMERIC
    END,
    CASE 
      WHEN previous_total_revenue > 0 THEN 
        ROUND(((current_total_revenue - previous_total_revenue) / previous_total_revenue * 100), 1)
      ELSE 0::NUMERIC
    END,
    CASE 
      WHEN previous_orders_count > 0 THEN 
        ROUND(((current_orders_count - previous_orders_count)::NUMERIC / previous_orders_count * 100), 1)
      ELSE 0::NUMERIC
    END,
    0::NUMERIC; -- Products growth placeholder
END;
$function$;