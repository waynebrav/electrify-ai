-- Fix function search paths for security without dropping functions
-- Update authenticate_admin function
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

-- Update update_customer_analytics_on_order function 
CREATE OR REPLACE FUNCTION public.update_customer_analytics_on_order()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
DECLARE
    favorite_cat UUID;
BEGIN
    -- Find favorite category
    SELECT favorite.category_id INTO favorite_cat
    FROM (
        SELECT p.category_id, SUM(oi.quantity) as total_items
        FROM public.order_items oi
        JOIN public.orders o ON oi.order_id = o.id
        JOIN public.products p ON oi.product_id = p.id
        WHERE o.user_id = NEW.user_id AND p.category_id IS NOT NULL
        GROUP BY p.category_id
        ORDER BY total_items DESC
        LIMIT 1
    ) AS favorite;

    -- Update or insert customer analytics
    INSERT INTO public.customer_analytics (user_id, total_spent, favorite_category_id, last_purchase_date)
    VALUES (NEW.user_id, NEW.total_amount, favorite_cat, NEW.created_at)
    ON CONFLICT (user_id) DO UPDATE SET
        total_spent = customer_analytics.total_spent + NEW.total_amount,
        favorite_category_id = COALESCE(favorite_cat, customer_analytics.favorite_category_id),
        last_purchase_date = NEW.created_at,
        updated_at = now();

    RETURN NEW;
END;
$function$;