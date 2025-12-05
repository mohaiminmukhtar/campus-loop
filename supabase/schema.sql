-- ============================================
-- CAMPUS LOOP DATABASE SCHEMA
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
CREATE POLICY "Users can view all profiles" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

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
CREATE POLICY "Anyone can view products" ON products
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create products" ON products
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their products" ON products
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their products" ON products
  FOR DELETE USING (auth.uid() = owner_id);

-- Indexes for performance
CREATE INDEX idx_products_owner_id ON products(owner_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_created_at ON products(created_at DESC);

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
CREATE POLICY "Users can view their sold/bought products" ON sold_products
  FOR SELECT USING (auth.uid() = owner_id OR auth.uid() = buyer_id);

CREATE POLICY "Owners can insert sold products" ON sold_products
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Indexes
CREATE INDEX idx_sold_products_owner_id ON sold_products(owner_id);
CREATE INDEX idx_sold_products_buyer_id ON sold_products(buyer_id);
CREATE INDEX idx_sold_products_sold_at ON sold_products(sold_at DESC);

-- ============================================
-- 4. CART TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS cart (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage their cart" ON cart
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 5. FAVORITES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage their favorites" ON favorites
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 6. BIDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  bidder_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Denormalized bidder data
  bidder_name TEXT NOT NULL,
  bidder_avatar_url TEXT,
  bidder_student_id TEXT
);

-- Enable RLS
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view bids" ON bids
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can place bids" ON bids
  FOR INSERT WITH CHECK (auth.uid() = bidder_id);

-- Indexes
CREATE INDEX idx_bids_product_id ON bids(product_id);
CREATE INDEX idx_bids_bidder_id ON bids(bidder_id);
CREATE INDEX idx_bids_amount ON bids(amount DESC);

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
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply to products table
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
    bidder_name = NEW.name,
    bidder_avatar_url = NEW.avatar_url,
    bidder_student_id = NEW.student_id
  WHERE bidder_id = NEW.id;
  
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
-- INDEXES FOR REAL-TIME SUBSCRIPTIONS
-- ============================================
CREATE INDEX idx_products_updated_at ON products(updated_at DESC);
CREATE INDEX idx_users_updated_at ON users(updated_at DESC);
