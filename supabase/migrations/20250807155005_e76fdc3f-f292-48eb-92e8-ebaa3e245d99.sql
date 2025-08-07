-- Update the admin record with a properly hashed password
-- Using crypt() function to generate proper password hash
UPDATE public.admins 
SET password_hash = crypt('admin123', gen_salt('bf'))
WHERE email = 'brainevicky@gmail.com';

-- If no admin exists, insert one with proper password hash
INSERT INTO public.admins (email, first_name, last_name, password_hash)
VALUES ('brainevicky@gmail.com', 'Braine', 'Vicky', crypt('admin123', gen_salt('bf')))
ON CONFLICT (email) DO UPDATE SET 
  password_hash = crypt('admin123', gen_salt('bf'));