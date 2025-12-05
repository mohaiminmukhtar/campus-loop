-- ============================================
-- CAMPUSLOOP COMPLETE DATABASE SETUP
-- Run this entire file in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- DROP EXISTING TABLES (OPTIONAL - UNCOMMENT IF NEEDED)
-- ============================================
-- DROP TABLE IF EXISTS bids CASCADE;
-- DROP TABLE IF EXISTS favorites CASCADE;
-- DROP TABLE IF EXISTS cart CASCADE;
-- DROP TABLE IF EXISTS sold_products CASCADE;
-- DROP TABLE IF EXISTS products CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  student_id TEXT UNIQUE,
  avatar_url TEXT,
  phone TEXT,
  bio TEXT,
  gender TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policies for users table
DROP POLICY IF EXISTS "Users can view all profiles" ON users;
CREATE POLICY "Users can view all profiles" ON users
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- 2. PRODUCTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL,
  condition TEXT,
  location TEXT,
  image_url TEXT,
  
  -- Bidding fields
  bidding_enabled BOOLEAN DEFAULT FALSE,
  starting_bid DECIMAL(10, 2),
  current_bid DECIMAL(10, 2),
  bid_count INTEGER DEFAULT 0,
  bid_end_date TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Denormalized user data for performance
  owner_name TEXT NOT NULL,
  owner_avatar_url TEXT,
  owner_student_id TEXT
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policies for products table
DROP POLICY IF EXISTS "Anyone can view products" ON products;
CREATE POLICY "Anyone can view products" ON products
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create products" ON products;
CREATE POLICY "Authenticated users can create products" ON products
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can update their products" ON products;
CREATE POLICY "Owners can update their products" ON products
  FOR UPDATE USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can delete their products" ON products;
CREATE POLICY "Owners can delete their products" ON products
  FOR DELETE USING (auth.uid() = owner_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_owner_id ON products(owner_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_updated_at ON products(updated_at DESC);

-- ============================================
-- 3. SOLD_PRODUCTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS sold_products (
  id UUID PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL,
  condition TEXT,
  location TEXT,
  image_url TEXT,
  
  -- Sale info
  sold_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'sold', -- 'sold' or 'deleted'
  
  -- Original metadata
  original_created_at TIMESTAMP WITH TIME ZONE,
  views INTEGER DEFAULT 0,
  
  -- Denormalized user data
  owner_name TEXT NOT NULL,
  owner_avatar_url TEXT,
  owner_student_id TEXT,
  buyer_name TEXT,
  buyer_avatar_url TEXT,
  buyer_student_id TEXT
);

-- Enable RLS
ALTER TABLE sold_products ENABLE ROW LEVEL SECURITY;

-- Policies for sold_products table
DROP POLICY IF EXISTS "Users can view their sold/bought products" ON sold_products;
CREATE POLICY "Users can view their sold/bought products" ON sold_products
  FOR SELECT USING (auth.uid() = owner_id OR auth.uid() = buyer_id);

DROP POLICY IF EXISTS "Owners can insert sold products" ON sold_products;
CREATE POLICY "Owners can insert sold products" ON sold_products
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sold_products_owner_id ON sold_products(owner_id);
CREATE INDEX IF NOT EXISTS idx_sold_products_buyer_id ON sold_products(buyer_id);
CREATE INDEX IF NOT EXISTS idx_sold_products_sold_at ON sold_products(sold_at DESC);

-- ============================================
-- 4. CART TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS cart (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  userid UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  productid UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(userid, productid)
);

-- Enable RLS
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can manage their cart" ON cart;
CREATE POLICY "Users can manage their cart" ON cart
  FOR ALL USING (auth.uid() = userid);

-- ============================================
-- 5. FAVORITES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  userid UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  productid UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(userid, productid)
);

-- Enable RLS
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can manage their favorites" ON favorites;
CREATE POLICY "Users can manage their favorites" ON favorites
  FOR ALL USING (auth.uid() = userid);

-- ============================================
-- 6. BIDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  productid UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  bidderid UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Denormalized bidder data
  biddername TEXT NOT NULL,
  bidder_avatar_url TEXT,
  bidder_student_id TEXT
);

-- Enable RLS
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Anyone can view bids" ON bids;
CREATE POLICY "Anyone can view bids" ON bids
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can place bids" ON bids;
CREATE POLICY "Authenticated users can place bids" ON bids
  FOR INSERT WITH CHECK (auth.uid() = bidderid);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bids_productid ON bids(productid);
CREATE INDEX IF NOT EXISTS idx_bids_bidderid ON bids(bidderid);
CREATE INDEX IF NOT EXISTS idx_bids_amount ON bids(amount DESC);

-- ============================================
-- TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply to products table
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTION: Sync user data across tables
-- ============================================
CREATE OR REPLACE FUNCTION sync_user_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Update products table
  UPDATE products
  SET 
    owner_name = NEW.name,
    owner_avatar_url = NEW.avatar_url,
    owner_student_id = NEW.student_id
  WHERE owner_id = NEW.id;
  
  -- Update bids table
  UPDATE bids
  SET 
    biddername = NEW.name,
    bidder_avatar_url = NEW.avatar_url,
    bidder_student_id = NEW.student_id
  WHERE bidderid = NEW.id;
  
  -- Update sold_products table (as owner)
  UPDATE sold_products
  SET 
    owner_name = NEW.name,
    owner_avatar_url = NEW.avatar_url,
    owner_student_id = NEW.student_id
  WHERE owner_id = NEW.id;
  
  -- Update sold_products table (as buyer)
  UPDATE sold_products
  SET 
    buyer_name = NEW.name,
    buyer_avatar_url = NEW.avatar_url,
    buyer_student_id = NEW.student_id
  WHERE buyer_id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to sync user data on update
DROP TRIGGER IF EXISTS sync_user_data_trigger ON users;
CREATE TRIGGER sync_user_data_trigger
  AFTER UPDATE ON users
  FOR EACH ROW
  WHEN (
    OLD.name IS DISTINCT FROM NEW.name OR
    OLD.avatar_url IS DISTINCT FROM NEW.avatar_url OR
    OLD.student_id IS DISTINCT FROM NEW.student_id
  )
  EXECUTE FUNCTION sync_user_data();

-- ============================================
-- FUNCTION: Auto-create user row on signup
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, name, email, student_id, avatar_url, gender)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    NEW.email,
    NEW.raw_user_meta_data->>'studentId',
    NEW.raw_user_meta_data->>'studentCardUrl',
    NEW.raw_user_meta_data->>'gender'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user row on auth signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================
-- FUNCTION: Move product to sold_products
-- ============================================
CREATE OR REPLACE FUNCTION move_to_sold_products(
  p_product_id UUID,
  p_buyer_id UUID DEFAULT NULL,
  p_status TEXT DEFAULT 'sold'
)
RETURNS BOOLEAN AS $$
DECLARE
  v_product products%ROWTYPE;
  v_buyer users%ROWTYPE;
BEGIN
  -- Get product details
  SELECT * INTO v_product FROM products WHERE id = p_product_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product not found';
  END IF;
  
  -- Get buyer details if provided
  IF p_buyer_id IS NOT NULL THEN
    SELECT * INTO v_buyer FROM users WHERE id = p_buyer_id;
  END IF;
  
  -- Insert into sold_products
  INSERT INTO sold_products (
    id, owner_id, buyer_id, title, description, price, category,
    condition, location, image_url, status, original_created_at,
    views, owner_name, owner_avatar_url, owner_student_id,
    buyer_name, buyer_avatar_url, buyer_student_id
  ) VALUES (
    v_product.id,
    v_product.owner_id,
    p_buyer_id,
    v_product.title,
    v_product.description,
    v_product.price,
    v_product.category,
    v_product.condition,
    v_product.location,
    v_product.image_url,
    p_status,
    v_product.created_at,
    v_product.views,
    v_product.owner_name,
    v_product.owner_avatar_url,
    v_product.owner_student_id,
    v_buyer.name,
    v_buyer.avatar_url,
    v_buyer.student_id
  );
  
  -- Delete from products
  DELETE FROM products WHERE id = p_product_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STORAGE POLICIES
-- ============================================

-- Student-cards bucket policies
DROP POLICY IF EXISTS "Users can upload their own student cards" ON storage.objects;
CREATE POLICY "Users can upload their own student cards"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'student-cards');

DROP POLICY IF EXISTS "Users can update their own student cards" ON storage.objects;
CREATE POLICY "Users can update their own student cards"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'student-cards');

DROP POLICY IF EXISTS "Users can delete their own student cards" ON storage.objects;
CREATE POLICY "Users can delete their own student cards"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'student-cards');

DROP POLICY IF EXISTS "Public read access to student cards" ON storage.objects;
CREATE POLICY "Public read access to student cards"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'student-cards');

-- Product-images bucket policies
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
CREATE POLICY "Authenticated users can upload product images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Users can update their own product images" ON storage.objects;
CREATE POLICY "Users can update their own product images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Users can delete their own product images" ON storage.objects;
CREATE POLICY "Users can delete their own product images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Public read access to product images" ON storage.objects;
CREATE POLICY "Public read access to product images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if all tables exist
SELECT 
  'users' as table_name, 
  COUNT(*) as row_count 
FROM users
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'sold_products', COUNT(*) FROM sold_products
UNION ALL
SELECT 'cart', COUNT(*) FROM cart
UNION ALL
SELECT 'favorites', COUNT(*) FROM favorites
UNION ALL
SELECT 'bids', COUNT(*) FROM bids;

-- ============================================
-- SETUP COMPLETE
-- ============================================
-- All tables, policies, triggers, and functions have been created!
-- Next steps:
-- 1. Create storage buckets: student-cards and product-images
-- 2. Set both buckets to PUBLIC
-- 3. Test the application
-- ============================================
