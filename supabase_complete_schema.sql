-- =====================================================
-- BOOMQUOTES COMPLETE DATABASE SCHEMA FOR SUPABASE
-- =====================================================
-- This script drops all existing tables and recreates them with the latest requirements
-- Run this in Supabase SQL Editor to reset and update your database

-- Drop all existing tables and functions
DROP TABLE IF EXISTS payout_history CASCADE;
DROP TABLE IF EXISTS airtime_rewards CASCADE;
DROP TABLE IF EXISTS referrals CASCADE;
DROP TABLE IF EXISTS checkin_streaks CASCADE;
DROP TABLE IF EXISTS check_ins CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS quotes CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Drop functions and triggers
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CORE TABLES
-- =====================================================

-- User profiles table (extends Supabase auth.users)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL, -- Required - can only be edited once
    phone_edited_at TIMESTAMP, -- Track when phone was last edited
    age INTEGER NOT NULL CHECK (age >= 13 AND age <= 120),
    gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
    country TEXT NOT NULL, -- Required country code (e.g., 'NG', 'US')
    address TEXT NOT NULL, -- Required full address
    referral_code TEXT NOT NULL UNIQUE,
    invite_code TEXT, -- Optional invite code used during signup
    total_referrals INTEGER DEFAULT 0,
    referral_earnings INTEGER DEFAULT 0, -- In cents/kobo
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quotes table with comprehensive categories
CREATE TABLE quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    text TEXT NOT NULL,
    author TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'motivation', 'love', 'hustle', 'wisdom', 'life', 'romantic', 
        'politics', 'social', 'funny', 'success', 'inspiration', 'mindfulness'
    )),
    source TEXT DEFAULT 'builtin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages table with 12+ categories
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    text TEXT NOT NULL,
    author TEXT NOT NULL DEFAULT 'Boomquotes',
    category TEXT NOT NULL CHECK (category IN (
        'good-morning', 'love', 'good-night', 'romantic', 'sad', 'breakup',
        'friendship', 'birthday', 'congratulations', 'encouragement', 
        'thank-you', 'apology', 'motivational', 'inspirational'
    )),
    source TEXT DEFAULT 'builtin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Favorites table for both quotes and messages
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    quote_id TEXT, -- Can reference quotes or messages
    quote_data JSONB NOT NULL, -- Store the full quote/message object
    item_type TEXT NOT NULL CHECK (item_type IN ('quote', 'message')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Daily check-ins table with 10-button system
CREATE TABLE check_ins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    date TEXT NOT NULL, -- YYYY-MM-DD format
    button_clicks JSONB DEFAULT '[]'::jsonb, -- Array of ButtonClick objects
    click_count INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    ads_shown INTEGER DEFAULT 0,
    last_click_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, date)
);

-- Check-in streaks table for tracking consecutive days
CREATE TABLE checkin_streaks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_checkin_date TEXT, -- YYYY-MM-DD format
    total_days INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Airtime rewards table
CREATE TABLE airtime_rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    amount INTEGER NOT NULL, -- Amount in local currency (cents/kobo)
    phone TEXT NOT NULL,
    country TEXT NOT NULL, -- Country code for Reloadly
    operator_id TEXT, -- Reloadly operator ID
    operator_name TEXT, -- Human readable operator name
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'success', 'failed')),
    check_in_count INTEGER NOT NULL DEFAULT 30, -- 30 check-ins required
    transaction_id TEXT, -- Reloadly transaction ID
    failure_reason TEXT, -- Error message if failed
    processed_at TIMESTAMP, -- When payout was completed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payout history table for tracking all reward transactions
CREATE TABLE payout_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    reward_id UUID REFERENCES airtime_rewards(id),
    amount INTEGER NOT NULL, -- Amount in USD cents
    currency TEXT DEFAULT 'USD', -- USD for global compatibility
    local_amount INTEGER, -- Amount in local currency
    local_currency TEXT, -- Local currency code
    phone TEXT NOT NULL,
    country TEXT NOT NULL,
    operator_name TEXT,
    status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'success', 'failed')),
    transaction_id TEXT,
    failure_reason TEXT,
    retry_count INTEGER DEFAULT 0,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Referral system table
CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    referee_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    referral_code TEXT NOT NULL,
    email TEXT, -- Email of person who signed up
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'invalid')),
    bonus_awarded BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_user_profiles_referral_code ON user_profiles(referral_code);
CREATE INDEX idx_user_profiles_invite_code ON user_profiles(invite_code);
CREATE INDEX idx_quotes_category ON quotes(category);
CREATE INDEX idx_messages_category ON messages(category);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_check_ins_user_date ON check_ins(user_id, date);
CREATE INDEX idx_check_ins_date ON check_ins(date);
CREATE INDEX idx_checkin_streaks_user_id ON checkin_streaks(user_id);
CREATE INDEX idx_airtime_rewards_user_id ON airtime_rewards(user_id);
CREATE INDEX idx_airtime_rewards_status ON airtime_rewards(status);
CREATE INDEX idx_payout_history_user_id ON payout_history(user_id);
CREATE INDEX idx_payout_history_status ON payout_history(status);
CREATE INDEX idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX idx_referrals_referee_id ON referrals(referee_id);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at for user_profiles
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to automatically update updated_at for checkin_streaks
CREATE TRIGGER update_checkin_streaks_updated_at 
    BEFORE UPDATE ON checkin_streaks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_referral_code TEXT;
BEGIN
    -- Generate unique referral code
    LOOP
        new_referral_code := 'BOOM' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
        EXIT WHEN NOT EXISTS (SELECT 1 FROM user_profiles WHERE referral_code = new_referral_code);
    END LOOP;

    -- Insert into user_profiles with required fields
    INSERT INTO user_profiles (
        id, 
        email, 
        full_name, 
        phone, 
        age, 
        gender, 
        country, 
        address,
        referral_code
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
        COALESCE(NEW.raw_user_meta_data->>'phone', '+234'),
        COALESCE((NEW.raw_user_meta_data->>'age')::INTEGER, 25),
        COALESCE(NEW.raw_user_meta_data->>'gender', 'other'),
        COALESCE(NEW.raw_user_meta_data->>'country', 'NG'),
        COALESCE(NEW.raw_user_meta_data->>'address', 'Address not provided'),
        new_referral_code
    );

    -- Initialize checkin streak
    INSERT INTO checkin_streaks (user_id) VALUES (NEW.id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkin_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE airtime_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Quotes and messages are public for reading
CREATE POLICY "Quotes are publicly readable" ON quotes
    FOR SELECT USING (true);

CREATE POLICY "Messages are publicly readable" ON messages
    FOR SELECT USING (true);

-- Favorites policies
CREATE POLICY "Users can manage own favorites" ON favorites
    FOR ALL USING (auth.uid() = user_id);

-- Check-ins policies
CREATE POLICY "Users can manage own check-ins" ON check_ins
    FOR ALL USING (auth.uid() = user_id);

-- Checkin streaks policies
CREATE POLICY "Users can view own streaks" ON checkin_streaks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks" ON checkin_streaks
    FOR UPDATE USING (auth.uid() = user_id);

-- Airtime rewards policies
CREATE POLICY "Users can view own rewards" ON airtime_rewards
    FOR SELECT USING (auth.uid() = user_id);

-- Payout history policies
CREATE POLICY "Users can view own payout history" ON payout_history
    FOR SELECT USING (auth.uid() = user_id);

-- Referrals policies
CREATE POLICY "Users can view own referrals" ON referrals
    FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referee_id);

-- =====================================================
-- INITIAL DATA SEEDING
-- =====================================================

-- Insert initial quotes
INSERT INTO quotes (text, author, category) VALUES
-- Motivational quotes
('The only way to do great work is to love what you do.', 'Steve Jobs', 'motivation'),
('Success is not final, failure is not fatal: it is the courage to continue that counts.', 'Winston Churchill', 'motivation'),
('Your limitation—it''s only your imagination.', 'Unknown', 'motivation'),
('Push yourself, because no one else is going to do it for you.', 'Unknown', 'motivation'),
('Great things never come from comfort zones.', 'Unknown', 'motivation'),

-- Love quotes
('Being deeply loved by someone gives you strength, while loving someone deeply gives you courage.', 'Lao Tzu', 'love'),
('The best thing to hold onto in life is each other.', 'Audrey Hepburn', 'love'),
('Love is not about how many days, weeks or months you''ve been together, it''s all about how much you love each other every day.', 'Unknown', 'love'),
('Love is composed of a single soul inhabiting two bodies.', 'Aristotle', 'love'),
('In all the world, there is no heart for me like yours.', 'Maya Angelou', 'love'),

-- Hustle quotes
('The hustle brings the dollar. The experience brings the knowledge. The persistence brings success.', 'Unknown', 'hustle'),
('Work hard in silence, let your success be your noise.', 'Frank Ocean', 'hustle'),
('Success is walking from failure to failure with no loss of enthusiasm.', 'Winston Churchill', 'hustle'),
('Don''t wait for opportunity. Create it.', 'Unknown', 'hustle'),
('The grind never stops.', 'Unknown', 'hustle'),

-- Wisdom quotes
('The only true wisdom is in knowing you know nothing.', 'Socrates', 'wisdom'),
('Be yourself; everyone else is already taken.', 'Oscar Wilde', 'wisdom'),
('Yesterday is history, tomorrow is a mystery, today is a gift.', 'Eleanor Roosevelt', 'wisdom'),
('The journey of a thousand miles begins with one step.', 'Lao Tzu', 'wisdom'),
('Wisdom is not a product of schooling but of the lifelong attempt to acquire it.', 'Albert Einstein', 'wisdom');

-- Insert initial messages
INSERT INTO messages (text, author, category) VALUES
-- Good morning messages
('Good morning! May your day be filled with positive thoughts and happy moments.', 'Boomquotes', 'good-morning'),
('Rise and shine! Today is a new opportunity to make your dreams come true.', 'Boomquotes', 'good-morning'),
('Good morning! Start your day with a grateful heart and watch miracles unfold.', 'Boomquotes', 'good-morning'),
('Wake up with determination, go to bed with satisfaction. Good morning!', 'Boomquotes', 'good-morning'),
('Good morning! Every sunrise brings new hope and new possibilities.', 'Boomquotes', 'good-morning'),

-- Love messages
('You are my today and all of my tomorrows.', 'Boomquotes', 'love'),
('In your smile, I see something more beautiful than the stars.', 'Boomquotes', 'love'),
('You are the reason I believe in love.', 'Boomquotes', 'love'),
('My heart is perfect because you are inside.', 'Boomquotes', 'love'),
('You are my sunshine on a cloudy day.', 'Boomquotes', 'love'),

-- Friendship messages
('True friends are never apart, maybe in distance but never in heart.', 'Boomquotes', 'friendship'),
('A friend is someone who knows all about you and still loves you.', 'Boomquotes', 'friendship'),
('Friends are the family we choose for ourselves.', 'Boomquotes', 'friendship'),
('Good friends are like stars, you don''t always see them but you know they''re always there.', 'Boomquotes', 'friendship'),
('Friendship is the only cement that will ever hold the world together.', 'Boomquotes', 'friendship');

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

-- Create a view to verify the schema
CREATE OR REPLACE VIEW schema_summary AS
SELECT 
    'user_profiles' as table_name, 
    (SELECT count(*) FROM user_profiles) as record_count
UNION ALL
SELECT 'quotes', (SELECT count(*) FROM quotes)
UNION ALL
SELECT 'messages', (SELECT count(*) FROM messages)
UNION ALL
SELECT 'favorites', (SELECT count(*) FROM favorites)
UNION ALL
SELECT 'check_ins', (SELECT count(*) FROM check_ins)
UNION ALL
SELECT 'checkin_streaks', (SELECT count(*) FROM checkin_streaks)
UNION ALL
SELECT 'airtime_rewards', (SELECT count(*) FROM airtime_rewards)
UNION ALL
SELECT 'payout_history', (SELECT count(*) FROM payout_history)
UNION ALL
SELECT 'referrals', (SELECT count(*) FROM referrals);

-- Show completion status
SELECT 'BOOMQUOTES DATABASE SCHEMA SUCCESSFULLY CREATED!' as status;
SELECT * FROM schema_summary;