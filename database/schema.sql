-- BTMM Trading App Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    timezone VARCHAR(50) DEFAULT 'UTC',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trades table
CREATE TABLE IF NOT EXISTS trades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('long', 'short')),
    entry_price DECIMAL(12, 5) NOT NULL,
    stop_loss DECIMAL(12, 5) NOT NULL,
    take_profit DECIMAL(12, 5) NOT NULL,
    position_size DECIMAL(12, 2) NOT NULL,
    risk_amount DECIMAL(12, 2) NOT NULL,
    risk_reward_ratio DECIMAL(5, 2),
    strategy VARCHAR(100),
    market_structure VARCHAR(20) CHECK (market_structure IN ('bullish', 'bearish', 'ranging')),
    entry_reason TEXT,
    notes TEXT,
    session VARCHAR(20) CHECK (session IN ('london', 'new_york', 'asian', 'overlap')),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'closed', 'cancelled')),
    entry_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    exit_time TIMESTAMP WITH TIME ZONE,
    exit_price DECIMAL(12, 5),
    exit_reason TEXT,
    pnl DECIMAL(12, 2),
    pnl_percentage DECIMAL(8, 4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Screenshots table
CREATE TABLE IF NOT EXISTS screenshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    trade_id UUID REFERENCES trades(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    screenshot_type VARCHAR(50) DEFAULT 'entry' CHECK (screenshot_type IN ('entry', 'exit', 'analysis', 'setup', 'other')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trading journal entries
CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    trade_id UUID REFERENCES trades(id) ON DELETE CASCADE,
    title VARCHAR(255),
    content TEXT NOT NULL,
    mood VARCHAR(20) CHECK (mood IN ('confident', 'nervous', 'excited', 'frustrated', 'calm', 'other')),
    market_conditions TEXT,
    lessons_learned TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- BTMM specific setups table
CREATE TABLE IF NOT EXISTS btmm_setups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    trade_id UUID REFERENCES trades(id) ON DELETE CASCADE,
    setup_type VARCHAR(50) NOT NULL, -- 'liquidity_grab', 'order_block', 'fair_value_gap', etc.
    timeframe VARCHAR(10) NOT NULL,
    confluence_factors TEXT[], -- Array of confluence factors
    market_structure_shift BOOLEAN DEFAULT FALSE,
    liquidity_level DECIMAL(12, 5),
    entry_trigger VARCHAR(100),
    invalidation_level DECIMAL(12, 5),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_status ON trades(status);
CREATE INDEX IF NOT EXISTS idx_trades_symbol ON trades(symbol);
CREATE INDEX IF NOT EXISTS idx_trades_created_at ON trades(created_at);
CREATE INDEX IF NOT EXISTS idx_screenshots_user_id ON screenshots(user_id);
CREATE INDEX IF NOT EXISTS idx_screenshots_trade_id ON screenshots(trade_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_btmm_setups_user_id ON btmm_setups(user_id);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE screenshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE btmm_setups ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Trades policies
CREATE POLICY "Users can view own trades" ON trades FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own trades" ON trades FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own trades" ON trades FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own trades" ON trades FOR DELETE USING (auth.uid() = user_id);

-- Screenshots policies
CREATE POLICY "Users can view own screenshots" ON screenshots FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own screenshots" ON screenshots FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own screenshots" ON screenshots FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own screenshots" ON screenshots FOR DELETE USING (auth.uid() = user_id);

-- Journal entries policies
CREATE POLICY "Users can view own journal entries" ON journal_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own journal entries" ON journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own journal entries" ON journal_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own journal entries" ON journal_entries FOR DELETE USING (auth.uid() = user_id);

-- BTMM setups policies
CREATE POLICY "Users can view own BTMM setups" ON btmm_setups FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own BTMM setups" ON btmm_setups FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own BTMM setups" ON btmm_setups FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own BTMM setups" ON btmm_setups FOR DELETE USING (auth.uid() = user_id);

-- Create storage bucket for screenshots
INSERT INTO storage.buckets (id, name, public) VALUES ('trading-screenshots', 'trading-screenshots', true);

-- Storage policies for screenshots
CREATE POLICY "Users can upload own screenshots" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'trading-screenshots' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own screenshots" ON storage.objects FOR SELECT USING (
    bucket_id = 'trading-screenshots' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own screenshots" ON storage.objects FOR DELETE USING (
    bucket_id = 'trading-screenshots' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trades_updated_at BEFORE UPDATE ON trades FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_screenshots_updated_at BEFORE UPDATE ON screenshots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON journal_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_btmm_setups_updated_at BEFORE UPDATE ON btmm_setups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
