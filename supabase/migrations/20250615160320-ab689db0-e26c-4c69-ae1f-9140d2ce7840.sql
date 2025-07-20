
-- First, let's check if we need to update the password hash for the existing admin
UPDATE public.admins 
SET password_hash = crypt('167813377Bs#', gen_salt('bf'))
WHERE email = 'silverstonebrav@gmail.com';

-- If the admin doesn't exist, insert them
INSERT INTO public.admins (
  email, 
  password_hash, 
  first_name, 
  last_name, 
  phone, 
  gender, 
  date_of_birth
) 
SELECT 
  'silverstonebrav@gmail.com',
  crypt('167813377Bs#', gen_salt('bf')),
  'Bravine',
  'Munialo',
  '0799296670',
  'male',
  '2003-06-18'
WHERE NOT EXISTS (
  SELECT 1 FROM public.admins WHERE email = 'silverstonebrav@gmail.com'
);
