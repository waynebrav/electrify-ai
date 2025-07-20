
-- Migration script to add AR products and categories

-- Insert categories if they don't exist
INSERT INTO public.categories (name, slug, description, image_url)
VALUES
('Smartphones', 'smartphones', 'Latest and greatest smartphones.', 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500'),
('Laptops', 'laptops', 'Powerful laptops for work and play.', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500'),
('Smart Home', 'smart-home', 'Automate your home with our smart devices.', 'https://images.unsplash.com/photo-1558002038-1055933bcdd2?w=500')
ON CONFLICT (slug) DO NOTHING;

DO $$
DECLARE
    smartphone_cat_id UUID;
    laptop_cat_id UUID;
    smart_home_cat_id UUID;
    
    product1_id UUID;
    product2_id UUID;
    product3_id UUID;
BEGIN
    -- Get category IDs
    SELECT id INTO smartphone_cat_id FROM public.categories WHERE slug = 'smartphones';
    SELECT id INTO laptop_cat_id FROM public.categories WHERE slug = 'laptops';
    SELECT id INTO smart_home_cat_id FROM public.categories WHERE slug = 'smart-home';

    -- Insert AR-enabled products if they don't exist, with real 3D models
    INSERT INTO public.products (name, slug, description, short_description, price, currency, stock_quantity, category_id, ar_enabled, model_3d_url, brand, is_featured, status)
    VALUES
    ('AR-Ready Smartphone X', 'ar-ready-smartphone-x', 'Experience augmented reality like never before with this powerful smartphone.', 'Next-gen AR phone', 89900, 'KES', 50, smartphone_cat_id, true, 'https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/iphone-x/model.gltf', 'Pixel', true, 'Active'),
    ('Holo-Laptop Pro', 'holo-laptop-pro', 'A laptop with holographic display capabilities, perfect for 3D modeling and AR development.', 'Holographic laptop', 249900, 'KES', 20, laptop_cat_id, true, 'https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/macbook/model.gltf', 'HP', true, 'Active'),
    ('Smart Speaker', 'smart-speaker', 'Control your smart home with this voice-activated smart speaker.', 'AR Smart Speaker', 79900, 'KES', 30, smart_home_cat_id, true, 'https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/smart-speaker/model.gltf', 'Samsung', false, 'Active')
    ON CONFLICT (slug) DO UPDATE SET
        model_3d_url = EXCLUDED.model_3d_url,
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        short_description = EXCLUDED.short_description;
    
    -- Get product IDs
    SELECT id INTO product1_id FROM public.products WHERE slug = 'ar-ready-smartphone-x';
    SELECT id INTO product2_id FROM public.products WHERE slug = 'holo-laptop-pro';
    SELECT id INTO product3_id FROM public.products WHERE slug = 'smart-speaker';

    -- Insert product images if not already present
    IF product1_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.product_images WHERE product_id = product1_id) THEN
        INSERT INTO public.product_images (product_id, url, alt_text, is_primary)
        VALUES (product1_id, 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbf1?w=500', 'AR-Ready Smartphone X', true);
    END IF;

    IF product2_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.product_images WHERE product_id = product2_id) THEN
        INSERT INTO public.product_images (product_id, url, alt_text, is_primary)
        VALUES (product2_id, 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500', 'Holo-Laptop Pro', true);
    END IF;

    IF product3_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.product_images WHERE product_id = product3_id) THEN
        INSERT INTO public.product_images (product_id, url, alt_text, is_primary)
        VALUES (product3_id, 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=500', 'Smart Speaker', true);
    END IF;

END $$;
