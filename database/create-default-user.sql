-- Create a default user for the no-auth version of the app
-- Run this after the main schema to insert a default user

-- Insert default user (this will be used for all data)
INSERT INTO users (
    id, 
    email, 
    first_name, 
    last_name, 
    created_at
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'default@btmm-trading.app',
    'BTMM',
    'Trader',
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Note: You may need to temporarily disable RLS policies to insert this user
-- depending on your Supabase setup. Run this in the Supabase SQL editor.