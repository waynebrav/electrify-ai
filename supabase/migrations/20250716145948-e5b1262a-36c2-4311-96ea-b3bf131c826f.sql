-- Drop ALL existing policies on carts table
DROP POLICY IF EXISTS "Users can insert their own carts" ON public.carts;
DROP POLICY IF EXISTS "Users can select their own carts" ON public.carts;
DROP POLICY IF EXISTS "Users can update their own carts" ON public.carts;
DROP POLICY IF EXISTS "Users can delete their own carts" ON public.carts;
DROP POLICY IF EXISTS "Users can insert into carts" ON public.carts;
DROP POLICY IF EXISTS "Enable insert for authenticated users and guests" ON public.carts;
DROP POLICY IF EXISTS "Enable read access for cart owners" ON public.carts;
DROP POLICY IF EXISTS "Enable update for cart owners" ON public.carts;
DROP POLICY IF EXISTS "Enable delete for cart owners" ON public.carts;

-- Drop ALL existing policies on cart_items table
DROP POLICY IF EXISTS "Users can insert items to their own carts" ON public.cart_items;
DROP POLICY IF EXISTS "Users can select items from their own carts" ON public.cart_items;
DROP POLICY IF EXISTS "Users can update items in their own carts" ON public.cart_items;
DROP POLICY IF EXISTS "Users can delete items from their own carts" ON public.cart_items;
DROP POLICY IF EXISTS "Enable insert for cart item owners" ON public.cart_items;
DROP POLICY IF EXISTS "Enable read access for cart item owners" ON public.cart_items;
DROP POLICY IF EXISTS "Enable update for cart item owners" ON public.cart_items;
DROP POLICY IF EXISTS "Enable delete for cart item owners" ON public.cart_items;

-- Remove session_id column from carts table
ALTER TABLE public.carts DROP COLUMN IF EXISTS session_id;

-- Create clean, consistent policies for carts table (authenticated users only)
CREATE POLICY "cart_insert_own" ON public.carts
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "cart_select_own" ON public.carts
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "cart_update_own" ON public.carts
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "cart_delete_own" ON public.carts
FOR DELETE USING (auth.uid() = user_id);

-- Create clean, consistent policies for cart_items table (authenticated users only)
CREATE POLICY "cart_items_insert_own" ON public.cart_items
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.carts 
    WHERE carts.id = cart_items.cart_id 
    AND carts.user_id = auth.uid()
  )
);

CREATE POLICY "cart_items_select_own" ON public.cart_items
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.carts 
    WHERE carts.id = cart_items.cart_id 
    AND carts.user_id = auth.uid()
  )
);

CREATE POLICY "cart_items_update_own" ON public.cart_items
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.carts 
    WHERE carts.id = cart_items.cart_id 
    AND carts.user_id = auth.uid()
  )
);

CREATE POLICY "cart_items_delete_own" ON public.cart_items
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.carts 
    WHERE carts.id = cart_items.cart_id 
    AND carts.user_id = auth.uid()
  )
);