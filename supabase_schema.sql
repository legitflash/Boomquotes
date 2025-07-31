-- Boomquotes Supabase Database Schema
-- Complete SQL schema with tables, functions, triggers, and RLS policies

-- =============================================
-- 1. USER PROFILES TABLE
-- =============================================
CREATE TABLE user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    phone TEXT,
    is_nigerian BOOLEAN DEFAULT false,
    profile_locked BOOLEAN DEFAULT false,
    referral_code TEXT UNIQUE NOT NULL,
    referred_by UUID REFERENCES user_profiles(id),
    total_referrals INTEGER DEFAULT 0,
    referral_earnings INTEGER DEFAULT 0, -- in kobo (₦1 = 100 kobo)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 2. QUOTES TABLE
-- =============================================
CREATE TABLE quotes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    text TEXT NOT NULL,
    author TEXT NOT NULL,
    category TEXT NOT NULL,
    source TEXT DEFAULT 'builtin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 3. FAVORITES/BOOKMARKS TABLE
-- =============================================
CREATE TABLE favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    quote_id UUID NOT NULL,
    text TEXT NOT NULL,
    author TEXT NOT NULL,
    category TEXT NOT NULL,
    source TEXT DEFAULT 'builtin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 4. CHECK-INS TABLE
-- =============================================
CREATE TABLE check_ins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    button_clicks JSONB DEFAULT '[]'::jsonb,
    click_count INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    ads_shown INTEGER DEFAULT 0,
    last_click_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- =============================================
-- 5. CHECK-IN STREAKS TABLE
-- =============================================
CREATE TABLE checkin_streaks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_checkin_date DATE,
    total_days INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 6. AIRTIME REWARDS TABLE
-- =============================================
CREATE TABLE airtime_rewards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    amount INTEGER NOT NULL, -- in kobo
    type TEXT NOT NULL CHECK (type IN ('checkin', 'referral')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    phone TEXT,
    description TEXT,
    checkin_count INTEGER,
    referral_id UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- =============================================
-- 7. REFERRALS TABLE
-- =============================================
CREATE TABLE referrals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    referrer_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    referred_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    checkin_days INTEGER DEFAULT 0,
    is_valid BOOLEAN DEFAULT false,
    reward_paid BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    validated_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(referred_id) -- Each user can only be referred once
);

-- =============================================
-- 8. INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX idx_quotes_category ON quotes(category);
CREATE INDEX idx_quotes_author ON quotes(author);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_checkins_user_date ON check_ins(user_id, date);
CREATE INDEX idx_checkins_date ON check_ins(date);
CREATE INDEX idx_streaks_user_id ON checkin_streaks(user_id);
CREATE INDEX idx_rewards_user_id ON airtime_rewards(user_id);
CREATE INDEX idx_rewards_status ON airtime_rewards(status);
CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_referrals_referred ON referrals(referred_id);
CREATE INDEX idx_user_profiles_referral_code ON user_profiles(referral_code);

-- =============================================
-- 9. FUNCTIONS
-- =============================================

-- Function to generate unique referral codes
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
    code TEXT;
    done BOOLEAN := FALSE;
BEGIN
    WHILE NOT done LOOP
        code := 'BOOM' || LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0');
        IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE referral_code = code) THEN
            done := TRUE;
        END IF;
    END LOOP;
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function to get user check-in status
CREATE OR REPLACE FUNCTION get_checkin_status(p_user_id UUID)
RETURNS TABLE(
    current_streak INTEGER,
    longest_streak INTEGER,
    total_checkins INTEGER,
    can_complete_today BOOLEAN,
    next_reward_at INTEGER
) AS $$
DECLARE
    streak_data RECORD;
    today_checkin RECORD;
BEGIN
    -- Get streak data
    SELECT cs.current_streak, cs.longest_streak, cs.total_days
    INTO streak_data
    FROM checkin_streaks cs
    WHERE cs.user_id = p_user_id;
    
    -- Get today's check-in
    SELECT completed
    INTO today_checkin
    FROM check_ins ci
    WHERE ci.user_id = p_user_id AND ci.date = CURRENT_DATE;
    
    RETURN QUERY SELECT
        COALESCE(streak_data.current_streak, 0),
        COALESCE(streak_data.longest_streak, 0),
        COALESCE(streak_data.total_days, 0),
        COALESCE(today_checkin.completed, FALSE) = FALSE,
        30; -- Next reward at 30 days
END;
$$ LANGUAGE plpgsql;

-- Function to process referral validation
CREATE OR REPLACE FUNCTION validate_referral(p_referred_id UUID)
RETURNS VOID AS $$
DECLARE
    referral_record RECORD;
    total_checkin_days INTEGER;
BEGIN
    -- Get referral record
    SELECT * INTO referral_record
    FROM referrals
    WHERE referred_id = p_referred_id AND is_valid = FALSE;
    
    IF FOUND THEN
        -- Count total check-in days for referred user
        SELECT COUNT(*)
        INTO total_checkin_days
        FROM check_ins
        WHERE user_id = p_referred_id AND completed = TRUE;
        
        -- Update referral record
        UPDATE referrals
        SET checkin_days = total_checkin_days
        WHERE id = referral_record.id;
        
        -- If 10+ days, mark as valid and create reward
        IF total_checkin_days >= 10 THEN
            UPDATE referrals
            SET is_valid = TRUE, validated_at = NOW()
            WHERE id = referral_record.id;
            
            -- Create referral reward for referrer
            INSERT INTO airtime_rewards (
                user_id, amount, type, description, referral_id
            ) VALUES (
                referral_record.referrer_id,
                10000, -- ₦100 in kobo
                'referral',
                'Referral bonus for ' || (SELECT email FROM user_profiles WHERE id = p_referred_id),
                p_referred_id
            );
            
            -- Update referrer stats
            UPDATE user_profiles
            SET referral_earnings = referral_earnings + 10000
            WHERE id = referral_record.referrer_id;
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 10. TRIGGERS
-- =============================================

-- Trigger to create user profile on auth user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (id, email, referral_code)
    VALUES (NEW.id, NEW.email, generate_referral_code());
    
    INSERT INTO checkin_streaks (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Trigger to update user_profiles.updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to validate referrals on check-in completion
CREATE OR REPLACE FUNCTION handle_checkin_completion()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.completed = TRUE AND (OLD.completed = FALSE OR OLD.completed IS NULL) THEN
        -- Update streak
        INSERT INTO checkin_streaks (user_id, current_streak, longest_streak, last_checkin_date, total_days)
        VALUES (NEW.user_id, 1, 1, NEW.date, 1)
        ON CONFLICT (user_id) DO UPDATE SET
            current_streak = CASE
                WHEN checkin_streaks.last_checkin_date = NEW.date - INTERVAL '1 day' THEN checkin_streaks.current_streak + 1
                WHEN checkin_streaks.last_checkin_date = NEW.date THEN checkin_streaks.current_streak
                ELSE 1
            END,
            longest_streak = GREATEST(checkin_streaks.longest_streak, 
                CASE
                    WHEN checkin_streaks.last_checkin_date = NEW.date - INTERVAL '1 day' THEN checkin_streaks.current_streak + 1
                    WHEN checkin_streaks.last_checkin_date = NEW.date THEN checkin_streaks.current_streak
                    ELSE 1
                END
            ),
            last_checkin_date = NEW.date,
            total_days = CASE
                WHEN checkin_streaks.last_checkin_date != NEW.date THEN checkin_streaks.total_days + 1
                ELSE checkin_streaks.total_days
            END,
            updated_at = NOW();
        
        -- Check for 30-day reward
        IF (SELECT current_streak FROM checkin_streaks WHERE user_id = NEW.user_id) = 30 THEN
            INSERT INTO airtime_rewards (user_id, amount, type, description, checkin_count)
            VALUES (
                NEW.user_id,
                50000, -- ₦500 in kobo
                'checkin',
                '30-day check-in streak reward',
                30
            );
        END IF;
        
        -- Validate referral
        PERFORM validate_referral(NEW.user_id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_checkin_completed
    AFTER INSERT OR UPDATE ON check_ins
    FOR EACH ROW EXECUTE FUNCTION handle_checkin_completion();

-- =============================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkin_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE airtime_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Quotes Policies (public read)
CREATE POLICY "Quotes are viewable by everyone" ON quotes
    FOR SELECT USING (true);

CREATE POLICY "Only authenticated users can insert quotes" ON quotes
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Favorites Policies
CREATE POLICY "Users can manage own favorites" ON favorites
    FOR ALL USING (auth.uid() = user_id);

-- Check-ins Policies
CREATE POLICY "Users can manage own check-ins" ON check_ins
    FOR ALL USING (auth.uid() = user_id);

-- Check-in Streaks Policies
CREATE POLICY "Users can view own streaks" ON checkin_streaks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks" ON checkin_streaks
    FOR UPDATE USING (auth.uid() = user_id);

-- Airtime Rewards Policies
CREATE POLICY "Users can view own rewards" ON airtime_rewards
    FOR SELECT USING (auth.uid() = user_id);

-- Referrals Policies
CREATE POLICY "Users can view referrals they made" ON referrals
    FOR SELECT USING (auth.uid() = referrer_id);

CREATE POLICY "Users can view referrals they received" ON referrals
    FOR SELECT USING (auth.uid() = referred_id);

-- =============================================
-- 12. SEED DATA
-- =============================================

-- Insert sample quotes
INSERT INTO quotes (text, author, category) VALUES
-- Motivational
('The only way to do great work is to love what you do. If you haven''t found it yet, keep looking. Don''t settle.', 'Steve Jobs', 'motivational'),
('Success is not final, failure is not fatal: it is the courage to continue that counts.', 'Winston Churchill', 'motivational'),
('Your limitation—it''s only your imagination.', 'Unknown', 'motivational'),
('Push yourself, because no one else is going to do it for you.', 'Unknown', 'motivational'),

-- Love
('Being deeply loved by someone gives you strength, while loving someone deeply gives you courage.', 'Lao Tzu', 'love'),
('You know you''re in love when you can''t fall asleep because reality is finally better than your dreams.', 'Dr. Seuss', 'love'),

-- Romantic
('The best thing to hold onto in life is each other.', 'Audrey Hepburn', 'romantic'),
('Love is not about how many days, weeks or months you''ve been together, it''s all about how much you love each other every day.', 'Unknown', 'romantic'),

-- Hustle
('The hustle brings the dollar. The experience brings the knowledge. The persistence brings success.', 'Unknown', 'hustle'),
('Work hard in silence, let your success be your noise.', 'Frank Ocean', 'hustle'),
('Success is walking from failure to failure with no loss of enthusiasm.', 'Winston Churchill', 'hustle'),
('Dream big and dare to fail.', 'Norman Vaughan', 'hustle'),

-- Wisdom
('The only true wisdom is in knowing you know nothing.', 'Socrates', 'wisdom'),
('Be yourself; everyone else is already taken.', 'Oscar Wilde', 'wisdom'),
('Yesterday is history, tomorrow is a mystery, today is a gift, that''s why they call it the present.', 'Eleanor Roosevelt', 'wisdom'),
('The journey of a thousand miles begins with one step.', 'Lao Tzu', 'wisdom'),

-- Life
('Life is what happens to you while you''re busy making other plans.', 'John Lennon', 'life'),
('Life is 10% what happens to you and 90% how you react to it.', 'Charles R. Swindoll', 'life'),
('The purpose of our lives is to be happy.', 'Dalai Lama', 'life'),
('Life is really simple, but we insist on making it complicated.', 'Confucius', 'life'),

-- Social
('The best way to find yourself is to lose yourself in the service of others.', 'Mahatma Gandhi', 'social'),
('Be the change that you wish to see in the world.', 'Mahatma Gandhi', 'social'),
('In a gentle way, you can shake the world.', 'Mahatma Gandhi', 'social'),

-- Politics
('Injustice anywhere is a threat to justice everywhere.', 'Martin Luther King Jr.', 'politics'),
('The only thing necessary for the triumph of evil is for good men to do nothing.', 'Edmund Burke', 'politics'),

-- Funny
('I haven''t failed. I''ve just found 10,000 ways that won''t work.', 'Thomas Edison', 'funny'),
('The trouble with having an open mind, of course, is that people will insist on coming along and trying to put things in it.', 'Terry Pratchett', 'funny'),
('Age is an issue of mind over matter. If you don''t mind, it doesn''t matter.', 'Mark Twain', 'funny');

-- =============================================
-- 13. USEFUL VIEWS (OPTIONAL)
-- =============================================

-- View for user dashboard stats
CREATE VIEW user_dashboard_stats AS
SELECT 
    up.id,
    up.email,
    up.full_name,
    up.phone,
    up.total_referrals,
    up.referral_earnings,
    cs.current_streak,
    cs.longest_streak,
    cs.total_days,
    COUNT(ar.id) FILTER (WHERE ar.status = 'pending') as pending_rewards,
    COALESCE(SUM(ar.amount) FILTER (WHERE ar.status = 'pending'), 0) as total_pending_amount
FROM user_profiles up
LEFT JOIN checkin_streaks cs ON up.id = cs.user_id
LEFT JOIN airtime_rewards ar ON up.id = ar.user_id
GROUP BY up.id, up.email, up.full_name, up.phone, up.total_referrals, up.referral_earnings,
         cs.current_streak, cs.longest_streak, cs.total_days;

-- =============================================
-- SETUP COMPLETE
-- =============================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;