-- Boomquotes Database Setup for Supabase
-- Run these commands in your Supabase SQL editor

-- 1. Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    country VARCHAR(2) DEFAULT 'NG',
    is_nigerian BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create quotes table
CREATE TABLE IF NOT EXISTS public.quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    text TEXT NOT NULL,
    author VARCHAR(255),
    category VARCHAR(100) DEFAULT 'motivational',
    source VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create favorites table
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
    quote_data JSONB NOT NULL, -- Store full quote data for quick access
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, quote_id)
);

-- 4. Create daily_checkins table
CREATE TABLE IF NOT EXISTS public.daily_checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    checkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
    clicks_completed INTEGER DEFAULT 0,
    total_clicks_required INTEGER DEFAULT 10,
    is_completed BOOLEAN DEFAULT FALSE,
    last_click_at TIMESTAMP WITH TIME ZONE,
    can_click_next_at TIMESTAMP WITH TIME ZONE,
    ads_viewed INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, checkin_date)
);

-- 5. Create checkin_streaks table to track user streaks
CREATE TABLE IF NOT EXISTS public.checkin_streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    total_checkins INTEGER DEFAULT 0,
    last_checkin_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 6. Create rewards table for airtime rewards
CREATE TABLE IF NOT EXISTS public.rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reward_type VARCHAR(50) NOT NULL DEFAULT 'airtime',
    amount DECIMAL(10, 2) NOT NULL DEFAULT 500.00,
    currency VARCHAR(3) DEFAULT 'NGN',
    checkins_required INTEGER DEFAULT 30,
    checkins_completed INTEGER DEFAULT 0,
    is_claimed BOOLEAN DEFAULT FALSE,
    claimed_at TIMESTAMP WITH TIME ZONE,
    phone_number VARCHAR(20), -- Phone number for airtime delivery
    status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create reward_claims table to track all reward claims
CREATE TABLE IF NOT EXISTS public.reward_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reward_id UUID NOT NULL REFERENCES public.rewards(id) ON DELETE CASCADE,
    phone_number VARCHAR(20) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'NGN',
    status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
    transaction_id VARCHAR(100),
    claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT
);

-- 8. Insert some sample quotes
INSERT INTO public.quotes (text, author, category, source) VALUES
('The only way to do great work is to love what you do.', 'Steve Jobs', 'motivational', 'builtin'),
('Life is what happens to you while you''re busy making other plans.', 'John Lennon', 'life', 'builtin'),
('The future belongs to those who believe in the beauty of their dreams.', 'Eleanor Roosevelt', 'dreams', 'builtin'),
('It is during our darkest moments that we must focus to see the light.', 'Aristotle', 'motivational', 'builtin'),
('The way to get started is to quit talking and begin doing.', 'Walt Disney', 'success', 'builtin'),
('Your limitation—it''s only your imagination.', 'Unknown', 'motivational', 'builtin'),
('Push yourself, because no one else is going to do it for you.', 'Unknown', 'motivational', 'builtin'),
('Great things never come from comfort zones.', 'Unknown', 'success', 'builtin'),
('Dream it. Wish it. Do it.', 'Unknown', 'dreams', 'builtin'),
('Success doesn''t just find you. You have to go out and get it.', 'Unknown', 'success', 'builtin');

-- 9. Create RLS (Row Level Security) policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkin_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_claims ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Quotes policies (public read access)
CREATE POLICY "Anyone can view quotes" ON public.quotes
    FOR SELECT TO authenticated USING (true);

-- Favorites policies
CREATE POLICY "Users can view own favorites" ON public.favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON public.favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON public.favorites
    FOR DELETE USING (auth.uid() = user_id);

-- Daily checkins policies
CREATE POLICY "Users can view own checkins" ON public.daily_checkins
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checkins" ON public.daily_checkins
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checkins" ON public.daily_checkins
    FOR UPDATE USING (auth.uid() = user_id);

-- Checkin streaks policies
CREATE POLICY "Users can view own streaks" ON public.checkin_streaks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streaks" ON public.checkin_streaks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks" ON public.checkin_streaks
    FOR UPDATE USING (auth.uid() = user_id);

-- Rewards policies
CREATE POLICY "Users can view own rewards" ON public.rewards
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rewards" ON public.rewards
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rewards" ON public.rewards
    FOR UPDATE USING (auth.uid() = user_id);

-- Reward claims policies
CREATE POLICY "Users can view own reward claims" ON public.reward_claims
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reward claims" ON public.reward_claims
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 10. Create functions for checkin logic

-- Function to handle daily checkin click
CREATE OR REPLACE FUNCTION handle_checkin_click(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_checkin_record RECORD;
    v_can_click BOOLEAN := FALSE;
    v_result JSONB;
BEGIN
    -- Get today's checkin record
    SELECT * INTO v_checkin_record
    FROM public.daily_checkins
    WHERE user_id = p_user_id AND checkin_date = CURRENT_DATE;
    
    -- If no record exists, create one
    IF NOT FOUND THEN
        INSERT INTO public.daily_checkins (user_id, checkin_date, clicks_completed, can_click_next_at)
        VALUES (p_user_id, CURRENT_DATE, 0, NOW())
        RETURNING * INTO v_checkin_record;
    END IF;
    
    -- Check if user can click (1 minute cooldown)
    IF v_checkin_record.can_click_next_at IS NULL OR NOW() >= v_checkin_record.can_click_next_at THEN
        v_can_click := TRUE;
    END IF;
    
    -- If checkin is already completed, return status
    IF v_checkin_record.is_completed THEN
        RETURN jsonb_build_object(
            'success', true,
            'already_completed', true,
            'clicks_completed', v_checkin_record.clicks_completed,
            'total_clicks_required', v_checkin_record.total_clicks_required,
            'can_click', false,
            'next_click_at', null,
            'message', 'Today''s checkin already completed!'
        );
    END IF;
    
    -- If user cannot click yet, return wait time
    IF NOT v_can_click THEN
        RETURN jsonb_build_object(
            'success', false,
            'can_click', false,
            'clicks_completed', v_checkin_record.clicks_completed,
            'total_clicks_required', v_checkin_record.total_clicks_required,
            'next_click_at', v_checkin_record.can_click_next_at,
            'message', 'Please wait before clicking again'
        );
    END IF;
    
    -- Process the click
    UPDATE public.daily_checkins
    SET 
        clicks_completed = clicks_completed + 1,
        ads_viewed = ads_viewed + 1,
        last_click_at = NOW(),
        can_click_next_at = NOW() + INTERVAL '1 minute',
        is_completed = CASE WHEN clicks_completed + 1 >= total_clicks_required THEN true ELSE false END,
        completed_at = CASE WHEN clicks_completed + 1 >= total_clicks_required THEN NOW() ELSE null END
    WHERE user_id = p_user_id AND checkin_date = CURRENT_DATE
    RETURNING * INTO v_checkin_record;
    
    -- Update streak if checkin is completed
    IF v_checkin_record.is_completed THEN
        PERFORM update_user_streak(p_user_id);
    END IF;
    
    RETURN jsonb_build_object(
        'success', true,
        'clicks_completed', v_checkin_record.clicks_completed,
        'total_clicks_required', v_checkin_record.total_clicks_required,
        'is_completed', v_checkin_record.is_completed,
        'can_click', NOT v_checkin_record.is_completed,
        'next_click_at', CASE WHEN v_checkin_record.is_completed THEN null ELSE v_checkin_record.can_click_next_at END,
        'message', CASE 
            WHEN v_checkin_record.is_completed THEN 'Checkin completed for today!'
            ELSE 'Click ' || (v_checkin_record.total_clicks_required - v_checkin_record.clicks_completed) || ' more times'
        END
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user streak
CREATE OR REPLACE FUNCTION update_user_streak(p_user_id UUID)
RETURNS void AS $$
DECLARE
    v_streak_record RECORD;
    v_yesterday DATE := CURRENT_DATE - INTERVAL '1 day';
    v_had_yesterday BOOLEAN;
BEGIN
    -- Check if user had checkin yesterday
    SELECT EXISTS(
        SELECT 1 FROM public.daily_checkins 
        WHERE user_id = p_user_id 
        AND checkin_date = v_yesterday 
        AND is_completed = true
    ) INTO v_had_yesterday;
    
    -- Get or create streak record
    SELECT * INTO v_streak_record
    FROM public.checkin_streaks
    WHERE user_id = p_user_id;
    
    IF NOT FOUND THEN
        INSERT INTO public.checkin_streaks (user_id, current_streak, longest_streak, total_checkins, last_checkin_date)
        VALUES (p_user_id, 1, 1, 1, CURRENT_DATE);
    ELSE
        -- Update streak
        IF v_had_yesterday THEN
            -- Continue streak
            UPDATE public.checkin_streaks
            SET 
                current_streak = current_streak + 1,
                longest_streak = GREATEST(longest_streak, current_streak + 1),
                total_checkins = total_checkins + 1,
                last_checkin_date = CURRENT_DATE,
                updated_at = NOW()
            WHERE user_id = p_user_id;
        ELSE
            -- Reset streak
            UPDATE public.checkin_streaks
            SET 
                current_streak = 1,
                longest_streak = GREATEST(longest_streak, 1),
                total_checkins = total_checkins + 1,
                last_checkin_date = CURRENT_DATE,
                updated_at = NOW()
            WHERE user_id = p_user_id;
        END IF;
    END IF;
    
    -- Check if user qualifies for reward (30 day streak for Nigerians)
    PERFORM check_reward_eligibility(p_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check reward eligibility
CREATE OR REPLACE FUNCTION check_reward_eligibility(p_user_id UUID)
RETURNS void AS $$
DECLARE
    v_user_profile RECORD;
    v_streak_record RECORD;
    v_existing_reward UUID;
BEGIN
    -- Get user profile
    SELECT * INTO v_user_profile
    FROM public.user_profiles
    WHERE id = p_user_id;
    
    -- Get streak record
    SELECT * INTO v_streak_record
    FROM public.checkin_streaks
    WHERE user_id = p_user_id;
    
    -- Only process for Nigerian users with 30+ streak
    IF v_user_profile.country = 'NG' AND v_streak_record.current_streak >= 30 THEN
        -- Check if reward already exists for this streak period
        SELECT id INTO v_existing_reward
        FROM public.rewards
        WHERE user_id = p_user_id 
        AND checkins_completed >= 30
        AND NOT is_claimed
        ORDER BY created_at DESC
        LIMIT 1;
        
        -- Create new reward if none exists
        IF NOT FOUND THEN
            INSERT INTO public.rewards (
                user_id, 
                reward_type, 
                amount, 
                currency, 
                checkins_required, 
                checkins_completed,
                phone_number
            )
            VALUES (
                p_user_id, 
                'airtime', 
                500.00, 
                'NGN', 
                30, 
                v_streak_record.current_streak,
                v_user_profile.phone
            );
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get checkin status
CREATE OR REPLACE FUNCTION get_checkin_status(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_checkin_record RECORD;
    v_streak_record RECORD;
    v_can_click BOOLEAN := false;
BEGIN
    -- Get today's checkin
    SELECT * INTO v_checkin_record
    FROM public.daily_checkins
    WHERE user_id = p_user_id AND checkin_date = CURRENT_DATE;
    
    -- Get streak info
    SELECT * INTO v_streak_record
    FROM public.checkin_streaks
    WHERE user_id = p_user_id;
    
    -- Check if can click
    IF FOUND AND NOT v_checkin_record.is_completed THEN
        IF v_checkin_record.can_click_next_at IS NULL OR NOW() >= v_checkin_record.can_click_next_at THEN
            v_can_click := true;
        END IF;
    END IF;
    
    RETURN jsonb_build_object(
        'has_checkin_today', FOUND,
        'clicks_completed', COALESCE(v_checkin_record.clicks_completed, 0),
        'total_clicks_required', COALESCE(v_checkin_record.total_clicks_required, 10),
        'is_completed', COALESCE(v_checkin_record.is_completed, false),
        'can_click', v_can_click,
        'next_click_at', v_checkin_record.can_click_next_at,
        'current_streak', COALESCE(v_streak_record.current_streak, 0),
        'total_checkins', COALESCE(v_streak_record.total_checkins, 0),
        'longest_streak', COALESCE(v_streak_record.longest_streak, 0)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON public.user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_checkin_streaks_updated_at 
    BEFORE UPDATE ON public.checkin_streaks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rewards_updated_at 
    BEFORE UPDATE ON public.rewards 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 12. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_daily_checkins_user_date ON public.daily_checkins(user_id, checkin_date);
CREATE INDEX IF NOT EXISTS idx_daily_checkins_date ON public.daily_checkins(checkin_date);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_quotes_category ON public.quotes(category);
CREATE INDEX IF NOT EXISTS idx_checkin_streaks_user_id ON public.checkin_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_rewards_user_id ON public.rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_reward_claims_user_id ON public.reward_claims(user_id);