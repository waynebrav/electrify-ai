-- Update existing products with working 3D models and AR capabilities
UPDATE products 
SET 
  model_3d_url = 'https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Models@master/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb',
  ar_enabled = true,
  video_url = 'https://www.w3schools.com/html/mov_bbb.mp4'
WHERE name = 'iPad Air M2';

UPDATE products 
SET 
  model_3d_url = 'https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Models@master/2.0/Avocado/glTF-Binary/Avocado.glb',
  ar_enabled = true,
  video_url = 'https://www.w3schools.com/html/mov_bbb.mp4'
WHERE name = 'Samsung Galaxy S22 Ultra';

-- Insert product images for AR products
INSERT INTO product_images (product_id, url, is_primary, alt_text, sort_order) 
SELECT 
  p.id,
  'https://cdn.mos.cms.futurecdn.net/nbDd9NSHRoTzcvV95niU63.jpg',
  true,
  p.name || ' - Primary Image',
  0
FROM products p 
WHERE p.name = 'iPad Air M2' 
AND NOT EXISTS (
  SELECT 1 FROM product_images pi WHERE pi.product_id = p.id
);

INSERT INTO product_images (product_id, url, is_primary, alt_text, sort_order) 
SELECT 
  p.id,
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjW0UlHWG7gz2WIRjBdQttJW2WZde3k5jdlA&s',
  false,
  p.name || ' - Secondary Image',
  1
FROM products p 
WHERE p.name = 'Samsung Galaxy S22 Ultra' 
AND NOT EXISTS (
  SELECT 1 FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = false
);

-- Add more AR-enabled products with 3D models
INSERT INTO products (
  name, 
  slug, 
  description, 
  short_description,
  price, 
  stock_quantity, 
  brand,
  model,
  sku,
  category_id, 
  currency,
  model_3d_url,
  video_url,
  ar_enabled,
  is_featured,
  warranty_info,
  return_policy
) VALUES 
(
  'MacBook Pro 16-inch',
  'macbook-pro-16-inch',
  'The most powerful MacBook Pro ever. Supercharged by Apple silicon.',
  'Professional laptop with M2 Pro chip',
  299999.00,
  15,
  'Apple',
  'MacBook Pro 16"',
  'MBP16-2023',
  (SELECT id FROM categories WHERE name = 'Laptops' LIMIT 1),
  'KES',
  'https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Models@master/2.0/BoomBox/glTF-Binary/BoomBox.glb',
  'https://www.w3schools.com/html/mov_bbb.mp4',
  true,
  true,
  '1 year limited warranty',
  '14-day return policy'
),
(
  'iPhone 15 Pro',
  'iphone-15-pro',
  'Titanium. So strong. So light. So Pro. Featuring the A17 Pro chip.',
  'Latest iPhone with titanium design',
  134999.00,
  25,
  'Apple',
  'iPhone 15 Pro',
  'IP15P-2023',
  (SELECT id FROM categories WHERE name = 'Smartphones' LIMIT 1),
  'KES',
  'https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Models@master/2.0/Sphere/glTF-Binary/Sphere.glb',
  'https://www.w3schools.com/html/mov_bbb.mp4',
  true,
  true,
  '1 year limited warranty',
  '14-day return policy'
),
(
  'Sony WH-1000XM5',
  'sony-wh-1000xm5',
  'Industry-leading noise canceling headphones with premium sound quality.',
  'Premium wireless noise-canceling headphones',
  39999.00,
  30,
  'Sony',
  'WH-1000XM5',
  'SONY-WH1000XM5',
  (SELECT id FROM categories WHERE name = 'Audio' LIMIT 1),
  'KES',
  'https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Models@master/2.0/Duck/glTF-Binary/Duck.glb',
  'https://www.w3schools.com/html/mov_bbb.mp4',
  true,
  false,
  '1 year manufacturer warranty',
  '30-day return policy'
) 
ON CONFLICT (slug) DO NOTHING;