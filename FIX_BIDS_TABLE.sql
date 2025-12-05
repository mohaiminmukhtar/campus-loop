-- Fix Bids Table and RLS Policies
-- Run this in Supabase SQL Editor
-- NOTE: The actual database uses camelCase (productid, bidderid, biddername)

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view bids" ON bids;
DROP POLICY IF EXISTS "Authenticated users can place bids" ON bids;
DROP POLICY IF EXISTS "Users can view their own bids" ON bids;

-- Recreate bids table (if needed) - using camelCase to match existing structure
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

-- Policy: Anyone can view bids
CREATE POLICY "Anyone can view bids" ON bids
  FOR SELECT 
  USING (true);

-- Policy: Authenticated users can place bids (using camelCase column name)
CREATE POLICY "Authenticated users can place bids" ON bids
  FOR INSERT 
  WITH CHECK (auth.uid() = bidderid);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_bids_productid ON bids(productid);
CREATE INDEX IF NOT EXISTS idx_bids_bidderid ON bids(bidderid);
CREATE INDEX IF NOT EXISTS idx_bids_amount ON bids(amount DESC);
CREATE INDEX IF NOT EXISTS idx_bids_created_at ON bids(created_at DESC);

-- Grant permissions
GRANT SELECT ON bids TO authenticated;
GRANT INSERT ON bids TO authenticated;
GRANT SELECT ON bids TO anon;

-- Verify the table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'bids'
ORDER BY ordinal_position;
