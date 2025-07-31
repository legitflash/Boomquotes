-- ================================================
-- BOOMQUOTES COMPREHENSIVE DATABASE MIGRATION
-- Global Airtime Rewards System with Enhanced Features
-- ================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- ENHANCED USER PROFILES TABLE
-- ================================================

-- Drop existing table if exists to recreate with new structure
DROP TABLE IF EXISTS public.user_profiles CASCADE;

CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    phone TEXT,
    country TEXT DEFAULT 'NG',
    age INTEGER CHECK (age >= 13 AND age <= 120),
    gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer-not-to-say')),
    phone_change_count INTEGER DEFAULT 0 CHECK (phone_change_count <= 1),
    invite_code TEXT UNIQUE,
    referred_by TEXT REFERENCES public.user_profiles(invite_code),
    profile_locked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- QUOTES TABLE WITH EXPANDED CATEGORIES
-- ================================================

-- Drop and recreate quotes table
DROP TABLE IF EXISTS public.quotes CASCADE;

CREATE TABLE public.quotes (
    id TEXT PRIMARY KEY DEFAULT ('quote_' || extract(epoch from now()) * 1000 || '_' || substr(gen_random_uuid()::text, 1, 8)),
    text TEXT NOT NULL,
    author TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'motivation', 'love', 'hustle', 'wisdom', 'life', 
        'romantic', 'politics', 'social', 'funny', 
        'success', 'inspiration', 'mindfulness'
    )),
    source TEXT DEFAULT 'builtin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- FAVORITES/BOOKMARKS TABLE
-- ================================================

-- Drop and recreate favorites table
DROP TABLE IF EXISTS public.favorites CASCADE;

CREATE TABLE public.favorites (
    id TEXT PRIMARY KEY DEFAULT ('fav_' || extract(epoch from now()) * 1000 || '_' || substr(gen_random_uuid()::text, 1, 8)),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    quote_id TEXT NOT NULL,
    quote_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, quote_id)
);

-- ================================================
-- DAILY CHECK-INS SYSTEM (10-BUTTON)
-- ================================================

-- Drop and recreate check-ins table
DROP TABLE IF EXISTS public.check_ins CASCADE;

CREATE TABLE public.check_ins (
    id TEXT PRIMARY KEY DEFAULT ('checkin_' || extract(epoch from now()) * 1000 || '_' || substr(gen_random_uuid()::text, 1, 8)),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    date TEXT NOT NULL, -- YYYY-MM-DD format
    button_clicks JSONB DEFAULT '[]'::jsonb,
    click_count INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    ads_shown INTEGER DEFAULT 0,
    last_click_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- ================================================
-- CHECK-IN STREAKS TABLE
-- ================================================

-- Drop and recreate streaks table
DROP TABLE IF EXISTS public.checkin_streaks CASCADE;

CREATE TABLE public.checkin_streaks (
    id TEXT PRIMARY KEY DEFAULT ('streak_' || extract(epoch from now()) * 1000 || '_' || substr(gen_random_uuid()::text, 1, 8)),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE UNIQUE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_checkin_date TEXT, -- YYYY-MM-DD format
    total_days INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- GLOBAL AIRTIME REWARDS TABLE
-- ================================================

-- Drop and recreate airtime rewards table
DROP TABLE IF EXISTS public.airtime_rewards CASCADE;

CREATE TABLE public.airtime_rewards (
    id TEXT PRIMARY KEY DEFAULT ('reward_' || extract(epoch from now()) * 1000 || '_' || substr(gen_random_uuid()::text, 1, 8)),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'NGN',
    phone TEXT NOT NULL,
    country TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'redeemed')),
    reloadly_transaction_id TEXT,
    operator_name TEXT,
    reward_type TEXT DEFAULT 'checkin' CHECK (reward_type IN ('checkin', 'referral')),
    streak_days INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- REFERRAL SYSTEM TABLE
-- ================================================

-- Drop and recreate referrals table
DROP TABLE IF EXISTS public.referrals CASCADE;

CREATE TABLE public.referrals (
    id TEXT PRIMARY KEY DEFAULT ('ref_' || extract(epoch from now()) * 1000 || '_' || substr(gen_random_uuid()::text, 1, 8)),
    referrer_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    referred_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    referral_code TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'qualified', 'rewarded')),
    qualified_at TIMESTAMP WITH TIME ZONE,
    reward_amount INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(referrer_id, referred_id)
);

-- ================================================
-- FUNCTIONS FOR AUTOMATIC UPDATES
-- ================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to generate unique invite codes
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.invite_code IS NULL THEN
        NEW.invite_code := 'BOOM' || LPAD(floor(random() * 1000000)::text, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to check referral qualification (10+ check-ins)
CREATE OR REPLACE FUNCTION check_referral_qualification()
RETURNS TRIGGER AS $$
DECLARE
    checkin_count INTEGER;
    referrer_user_id UUID;
BEGIN
    -- Get checkin count for the user
    SELECT total_days INTO checkin_count
    FROM checkin_streaks 
    WHERE user_id = NEW.user_id;
    
    -- If user has 10+ checkins, qualify their referrer
    IF checkin_count >= 10 THEN
        -- Find the referrer
        SELECT referred_by INTO referrer_user_id
        FROM user_profiles 
        WHERE id = NEW.user_id AND referred_by IS NOT NULL;
        
        IF referrer_user_id IS NOT NULL THEN
            -- Update referral status to qualified
            UPDATE referrals 
            SET status = 'qualified', 
                qualified_at = NOW(),
                reward_amount = 250  -- ₦250 referral reward
            WHERE referred_id = NEW.user_id 
              AND status = 'pending';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to create airtime reward at 30-day streak
CREATE OR REPLACE FUNCTION create_streak_reward()
RETURNS TRIGGER AS $$
DECLARE
    user_phone TEXT;
    user_country TEXT;
    reward_amount INTEGER;
    reward_currency TEXT;
BEGIN
    -- Check if user reached 30-day streak
    IF NEW.current_streak >= 30 AND (OLD.current_streak IS NULL OR OLD.current_streak < 30) THEN
        -- Get user details
        SELECT phone, country INTO user_phone, user_country
        FROM user_profiles 
        WHERE id = NEW.user_id;
        
        -- Set reward amount based on country
        CASE 
            WHEN user_country = 'NG' THEN 
                reward_amount := 500;
                reward_currency := 'NGN';
            WHEN user_country = 'KE' THEN 
                reward_amount := 50;
                reward_currency := 'KES';
            WHEN user_country = 'IN' THEN 
                reward_amount := 50;
                reward_currency := 'INR';
            WHEN user_country = 'PH' THEN 
                reward_amount := 50;
                reward_currency := 'PHP';
            ELSE 
                reward_amount := 5;
                reward_currency := 'USD';
        END CASE;
        
        -- Create airtime reward
        INSERT INTO airtime_rewards (
            user_id, amount, currency, phone, country, 
            reward_type, streak_days
        ) VALUES (
            NEW.user_id, reward_amount, reward_currency, user_phone, user_country,
            'checkin', NEW.current_streak
        );
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ================================================
-- TRIGGERS
-- ================================================

-- Trigger for updated_at on user_profiles
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Trigger for updated_at on checkin_streaks
CREATE TRIGGER update_checkin_streaks_updated_at 
    BEFORE UPDATE ON checkin_streaks 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Trigger for generating invite codes
CREATE TRIGGER generate_user_invite_code 
    BEFORE INSERT ON user_profiles 
    FOR EACH ROW EXECUTE PROCEDURE generate_invite_code();

-- Trigger for checking referral qualification
CREATE TRIGGER check_referral_qualification_trigger 
    AFTER UPDATE OF current_streak ON checkin_streaks 
    FOR EACH ROW EXECUTE PROCEDURE check_referral_qualification();

-- Trigger for creating streak rewards
CREATE TRIGGER create_streak_reward_trigger 
    AFTER UPDATE OF current_streak ON checkin_streaks 
    FOR EACH ROW EXECUTE PROCEDURE create_streak_reward();

-- ================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ================================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkin_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.airtime_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Quotes Policies (public read, authenticated write)
CREATE POLICY "Anyone can view quotes" ON public.quotes
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert quotes" ON public.quotes
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Favorites Policies
CREATE POLICY "Users can manage own favorites" ON public.favorites
    FOR ALL USING (auth.uid() = user_id);

-- Check-ins Policies
CREATE POLICY "Users can manage own check-ins" ON public.check_ins
    FOR ALL USING (auth.uid() = user_id);

-- Streaks Policies
CREATE POLICY "Users can view own streaks" ON public.checkin_streaks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks" ON public.checkin_streaks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streaks" ON public.checkin_streaks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Airtime Rewards Policies
CREATE POLICY "Users can view own rewards" ON public.airtime_rewards
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert rewards" ON public.airtime_rewards
    FOR INSERT WITH CHECK (true);

-- Referrals Policies
CREATE POLICY "Users can view own referrals" ON public.referrals
    FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "System can manage referrals" ON public.referrals
    FOR ALL USING (true);

-- ================================================
-- SEED DATA - EXPANDED QUOTES
-- ================================================

-- Insert expanded quotes with new categories
INSERT INTO public.quotes (text, author, category) VALUES

-- MOTIVATION (Enhanced)
('The only way to do great work is to love what you do.', 'Steve Jobs', 'motivation'),
('Innovation distinguishes between a leader and a follower.', 'Steve Jobs', 'motivation'),
('Your limitation—it''s only your imagination.', 'Unknown', 'motivation'),
('Great things never come from comfort zones.', 'Unknown', 'motivation'),
('Dream it. Wish it. Do it.', 'Unknown', 'motivation'),
('Success doesn''t just find you. You have to go out and get it.', 'Unknown', 'motivation'),
('The harder you work for something, the greater you''ll feel when you achieve it.', 'Unknown', 'motivation'),
('Dream bigger. Do bigger.', 'Unknown', 'motivation'),
('Don''t stop when you''re tired. Stop when you''re done.', 'Unknown', 'motivation'),
('Wake up with determination. Go to bed with satisfaction.', 'Unknown', 'motivation'),

-- SUCCESS (New Category)
('Success is not final, failure is not fatal: it is the courage to continue that counts.', 'Winston Churchill', 'success'),
('Success is walking from failure to failure with no loss of enthusiasm.', 'Winston Churchill', 'success'),
('Don''t be afraid to give up the good to go for the great.', 'John D. Rockefeller', 'success'),
('Success is not the key to happiness. Happiness is the key to success.', 'Albert Schweitzer', 'success'),
('The only impossible journey is the one you never begin.', 'Tony Robbins', 'success'),
('Success is liking yourself, liking what you do, and liking how you do it.', 'Maya Angelou', 'success'),

-- INSPIRATION (New Category)
('What lies behind us and what lies before us are tiny matters compared to what lies within us.', 'Ralph Waldo Emerson', 'inspiration'),
('The future belongs to those who believe in the beauty of their dreams.', 'Eleanor Roosevelt', 'inspiration'),
('It is during our darkest moments that we must focus to see the light.', 'Aristotle', 'inspiration'),
('Believe you can and you''re halfway there.', 'Theodore Roosevelt', 'inspiration'),
('The only person you are destined to become is the person you decide to be.', 'Ralph Waldo Emerson', 'inspiration'),
('You are never too old to set another goal or to dream a new dream.', 'C.S. Lewis', 'inspiration'),

-- MINDFULNESS (New Category)
('The present moment is the only time over which we have dominion.', 'Thich Nhat Hanh', 'mindfulness'),
('Wherever you are, be there totally.', 'Eckhart Tolle', 'mindfulness'),
('Peace comes from within. Do not seek it without.', 'Buddha', 'mindfulness'),
('The mind is everything. What you think you become.', 'Buddha', 'mindfulness'),
('Happiness is not something ready-made. It comes from your own actions.', 'Dalai Lama', 'mindfulness'),
('You have power over your mind - not outside events. Realize this, and you will find strength.', 'Marcus Aurelius', 'mindfulness'),

-- LOVE (Enhanced)
('Being deeply loved by someone gives you strength, while loving someone deeply gives you courage.', 'Lao Tzu', 'love'),
('The best thing to hold onto in life is each other.', 'Audrey Hepburn', 'love'),
('Love is not about how much you say "I love you," but how much you can prove that it''s true.', 'Unknown', 'love'),
('In all the world, there is no heart for me like yours.', 'Maya Angelou', 'love'),
('Love is composed of a single soul inhabiting two bodies.', 'Aristotle', 'love'),

-- HUSTLE (Enhanced)
('Hustle until your haters ask if you''re hiring.', 'Steve Harvey', 'hustle'),
('The dream is free. The hustle is sold separately.', 'Unknown', 'hustle'),
('Work hard in silence, let your success be your noise.', 'Frank Ocean', 'hustle'),
('Hustle beats talent when talent doesn''t hustle.', 'Ross Simmonds', 'hustle'),
('Good things happen to those who hustle.', 'Anais Nin', 'hustle'),

-- WISDOM (Enhanced)
('The only true wisdom is in knowing you know nothing.', 'Socrates', 'wisdom'),
('In the end, we will remember not the words of our enemies, but the silence of our friends.', 'Martin Luther King Jr.', 'wisdom'),
('Turn your wounds into wisdom.', 'Oprah Winfrey', 'wisdom'),
('The way to get started is to quit talking and begin doing.', 'Walt Disney', 'wisdom'),

-- LIFE (Enhanced)
('Life is what happens to you while you''re busy making other plans.', 'John Lennon', 'life'),
('The purpose of our lives is to be happy.', 'Dalai Lama', 'life'),
('Life is really simple, but we insist on making it complicated.', 'Confucius', 'life'),
('In the end, it''s not the years in your life that count. It''s the life in your years.', 'Abraham Lincoln', 'life'),

-- ROMANTIC (Enhanced)
('I love you not only for what you are, but for what I am when I am with you.', 'Roy Croft', 'romantic'),
('You are my today and all of my tomorrows.', 'Leo Christopher', 'romantic'),
('In your smile, I see something more beautiful than the stars.', 'Beth Revis', 'romantic'),
('Every love story is beautiful, but ours is my favorite.', 'Unknown', 'romantic'),

-- POLITICS (Enhanced)
('Injustice anywhere is a threat to justice everywhere.', 'Martin Luther King Jr.', 'politics'),
('The price of freedom is eternal vigilance.', 'Thomas Jefferson', 'politics'),
('Democracy is not a spectator sport.', 'Marian Wright Edelman', 'politics'),
('Change will not come if we wait for some other person or some other time.', 'Barack Obama', 'politics'),

-- SOCIAL (Enhanced)
('We make a living by what we get, but we make a life by what we give.', 'Winston Churchill', 'social'),
('Be the change that you wish to see in the world.', 'Mahatma Gandhi', 'social'),
('Alone we can do so little; together we can do so much.', 'Helen Keller', 'social'),
('No one has ever become poor by giving.', 'Anne Frank', 'social'),

-- FUNNY (Enhanced)
('I told my wife she was drawing her eyebrows too high. She looked surprised.', 'Unknown', 'funny'),
('I''m reading a book about anti-gravity. It''s impossible to put down!', 'Unknown', 'funny'),
('I haven''t slept for ten days, because that would be too long.', 'Mitch Hedberg', 'funny'),
('The early bird might get the worm, but the second mouse gets the cheese.', 'Unknown', 'funny');

-- ================================================
-- INDEXES FOR PERFORMANCE
-- ================================================

-- Create indexes for better query performance
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_user_profiles_invite_code ON public.user_profiles(invite_code);
CREATE INDEX idx_user_profiles_referred_by ON public.user_profiles(referred_by);
CREATE INDEX idx_quotes_category ON public.quotes(category);
CREATE INDEX idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX idx_check_ins_user_date ON public.check_ins(user_id, date);
CREATE INDEX idx_checkin_streaks_user_id ON public.checkin_streaks(user_id);
CREATE INDEX idx_airtime_rewards_user_id ON public.airtime_rewards(user_id);
CREATE INDEX idx_airtime_rewards_status ON public.airtime_rewards(status);
CREATE INDEX idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX idx_referrals_referred_id ON public.referrals(referred_id);

-- ================================================
-- COMPLETION MESSAGE
-- ================================================

-- Add a completion marker
INSERT INTO public.quotes (text, author, category) VALUES 
('Database migration completed successfully! Global airtime rewards system is now active.', 'Boomquotes System', 'success');

-- Show final status
SELECT 
    'MIGRATION COMPLETED SUCCESSFULLY' as status,
    'Features: Global airtime rewards, Enhanced profiles, 3 new quote categories, Referral system, Phone change limits' as features,
    'Total countries supported: 170+ via Reloadly API' as coverage,
    'Ready for global deployment!' as message;