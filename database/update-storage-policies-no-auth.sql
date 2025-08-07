-- Update Supabase storage policies for no-auth version
-- Run this in your Supabase SQL Editor AFTER running the main schema

-- First, drop the existing storage policies
DROP POLICY IF EXISTS "Users can upload own screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own screenshots" ON storage.objects;

-- Create new public policies for the no-auth version
CREATE POLICY "Public can upload screenshots" ON storage.objects 
FOR INSERT WITH CHECK (
    bucket_id = 'trade-screenshots'
);

CREATE POLICY "Public can view screenshots" ON storage.objects 
FOR SELECT USING (
    bucket_id = 'trade-screenshots'
);

CREATE POLICY "Public can delete screenshots" ON storage.objects 
FOR DELETE USING (
    bucket_id = 'trade-screenshots'
);

-- Make sure the bucket allows public access
UPDATE storage.buckets 
SET public = true 
WHERE id = 'trade-screenshots';

-- Optional: If you want to disable RLS entirely for storage (less secure but simpler)
-- ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;