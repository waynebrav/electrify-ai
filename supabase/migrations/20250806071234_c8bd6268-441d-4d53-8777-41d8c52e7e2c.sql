-- Add missing RLS policies for wishlist_items table
CREATE POLICY "Users can manage their own wishlist items" 
ON public.wishlist_items 
FOR ALL 
USING (user_id = auth.uid());

-- Fix remaining functions with search path issues
-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = 'public'
AS $$
begin
  insert into public.profiles (id, email, created_at, auth_provider)
  values (
    new.id::text,
    new.email,
    now(),
    new.raw_app_meta_data->>'provider'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Update update_timestamp function
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Update update_order_on_payment_verification function
CREATE OR REPLACE FUNCTION public.update_order_on_payment_verification()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.status = 'completed' AND NEW.verification_status = 'verified' THEN
    UPDATE public.orders
    SET payment_status = 'paid', status = 
      CASE 
        WHEN status = 'pending' THEN 'processing' 
        ELSE status 
      END
    WHERE id = NEW.order_id;
  END IF;
  RETURN NEW;
END;
$$;