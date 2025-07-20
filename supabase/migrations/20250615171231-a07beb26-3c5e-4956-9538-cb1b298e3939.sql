
-- Create function to authenticate admin users
CREATE OR REPLACE FUNCTION public.authenticate_admin(admin_email TEXT, admin_password TEXT)
RETURNS TABLE(id UUID, email TEXT, first_name TEXT, last_name TEXT) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT a.id, a.email, a.first_name, a.last_name
  FROM public.admins a
  WHERE a.email = admin_email 
  AND a.password_hash = crypt(admin_password, a.password_hash);
END;
$$;
