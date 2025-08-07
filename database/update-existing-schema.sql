-- Update existing schema for no-auth public access
-- Run this in your Supabase SQL Editor to make screenshots work with no-auth app

-- Update storage policies to allow public access (no authentication required)
DROP POLICY IF EXISTS "Allow authenticated users to upload screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update storage screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete storage screenshots" ON storage.objects;

-- Create new public storage policies for no-auth setup
CREATE POLICY "Public can upload trading screenshots" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'trading-screenshots');

CREATE POLICY "Public can view trading screenshots" ON storage.objects
FOR SELECT USING (bucket_id = 'trading-screenshots');

CREATE POLICY "Public can update trading screenshots" ON storage.objects
FOR UPDATE USING (bucket_id = 'trading-screenshots');

CREATE POLICY "Public can delete trading screenshots" ON storage.objects
FOR DELETE USING (bucket_id = 'trading-screenshots');

-- Update table policies to allow public access
DROP POLICY IF EXISTS "Allow authenticated users to read screenshots" ON screenshots;
DROP POLICY IF EXISTS "Allow authenticated users to insert screenshots" ON screenshots;
DROP POLICY IF EXISTS "Allow authenticated users to update screenshots" ON screenshots;
DROP POLICY IF EXISTS "Allow authenticated users to delete screenshots" ON screenshots;

-- Create new public table policies for no-auth setup
CREATE POLICY "Public can read screenshots" ON screenshots
FOR SELECT USING (true);

CREATE POLICY "Public can insert screenshots" ON screenshots
FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can update screenshots" ON screenshots
FOR UPDATE USING (true);

CREATE POLICY "Public can delete screenshots" ON screenshots
FOR DELETE USING (true);

-- Ensure the bucket is public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'trading-screenshots';