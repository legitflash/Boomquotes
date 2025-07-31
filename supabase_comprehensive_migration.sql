-- COMPREHENSIVE SUPABASE MIGRATION FOR BOOMQUOTES
-- This migration includes all features: quotes, messages, users, rewards, payouts, referrals, check-ins
-- Drop existing tables and create fresh schema with all enhancements

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables (if any) to start fresh
DROP TABLE IF EXISTS payout_history CASCADE;
DROP TABLE IF EXISTS referrals CASCADE;
DROP TABLE IF EXISTS airtime_rewards CASCADE;
DROP TABLE IF EXISTS checkin_streaks CASCADE;
DROP TABLE IF EXISTS check_ins CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS quotes CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- User profiles table (extends Supabase auth.users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  country TEXT DEFAULT 'US',
  age INTEGER,
  gender TEXT,
  profile_locked BOOLEAN DEFAULT FALSE,
  phone_edit_count INTEGER DEFAULT 0,
  referral_code TEXT UNIQUE,
  is_nigerian BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Quotes table
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  text TEXT NOT NULL,
  author TEXT NOT NULL,
  category TEXT NOT NULL,
  source TEXT DEFAULT 'builtin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Messages table for dedicated messages page
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  text TEXT NOT NULL,
  author TEXT NOT NULL,
  category TEXT NOT NULL,
  source TEXT DEFAULT 'builtin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Favorites table for bookmarked quotes/messages
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  quote_id TEXT NOT NULL,
  quote_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Daily check-ins table with 10-button system
CREATE TABLE check_ins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  date TEXT NOT NULL, -- YYYY-MM-DD format
  button_clicks JSONB DEFAULT '[]'::jsonb, -- Array of ButtonClick objects
  click_count INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  ads_shown INTEGER DEFAULT 0,
  last_click_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Airtime rewards table with enhanced global support
CREATE TABLE airtime_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL, -- Amount in local currency
  phone TEXT NOT NULL,
  country TEXT NOT NULL, -- Country code for Reloadly
  operator_id TEXT, -- Reloadly operator ID
  status TEXT DEFAULT 'pending', -- pending, processing, success, failed
  check_in_count INTEGER NOT NULL, -- 30 check-ins required
  transaction_id TEXT, -- Reloadly transaction ID
  failure_reason TEXT, -- Error message if failed
  processed_at TIMESTAMP WITH TIME ZONE, -- When payout was completed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payout history table for tracking all reward transactions
CREATE TABLE payout_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  reward_id UUID REFERENCES airtime_rewards(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD', -- USD for global compatibility
  local_amount INTEGER, -- Amount in local currency
  local_currency TEXT, -- Local currency code
  phone TEXT NOT NULL,
  country TEXT NOT NULL,
  operator_name TEXT,
  status TEXT NOT NULL, -- pending, processing, success, failed
  transaction_id TEXT,
  failure_reason TEXT,
  retry_count INTEGER DEFAULT 0,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Referral system table
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  referee_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  referral_code TEXT NOT NULL,
  email TEXT, -- Email of person who signed up
  status TEXT DEFAULT 'pending', -- pending, completed, invalid
  bonus_awarded BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Row Level Security (RLS) Policies
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

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Quotes policies (public read)
CREATE POLICY "Anyone can view quotes" ON quotes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create quotes" ON quotes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Messages policies (public read)
CREATE POLICY "Anyone can view messages" ON messages
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create messages" ON messages
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Favorites policies
CREATE POLICY "Users can view own favorites" ON favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own favorites" ON favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Check-ins policies
CREATE POLICY "Users can view own check-ins" ON check_ins
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own check-ins" ON check_ins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own check-ins" ON check_ins
  FOR UPDATE USING (auth.uid() = user_id);

-- Checkin streaks policies
CREATE POLICY "Users can view own streaks" ON checkin_streaks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own streaks" ON checkin_streaks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks" ON checkin_streaks
  FOR UPDATE USING (auth.uid() = user_id);

-- Airtime rewards policies
CREATE POLICY "Users can view own rewards" ON airtime_rewards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own rewards" ON airtime_rewards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Payout history policies
CREATE POLICY "Users can view own payout history" ON payout_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own payout history" ON payout_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Referrals policies
CREATE POLICY "Users can view own referrals" ON referrals
  FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referee_id);

CREATE POLICY "Users can create referrals" ON referrals
  FOR INSERT WITH CHECK (auth.uid() = referrer_id);

-- Indexes for performance
CREATE INDEX idx_quotes_category ON quotes(category);
CREATE INDEX idx_messages_category ON messages(category);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_check_ins_user_date ON check_ins(user_id, date);
CREATE INDEX idx_checkin_streaks_user_id ON checkin_streaks(user_id);
CREATE INDEX idx_airtime_rewards_user_id ON airtime_rewards(user_id);
CREATE INDEX idx_airtime_rewards_status ON airtime_rewards(status);
CREATE INDEX idx_payout_history_user_id ON payout_history(user_id);
CREATE INDEX idx_payout_history_status ON payout_history(status);
CREATE INDEX idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX idx_referrals_code ON referrals(referral_code);
CREATE INDEX idx_user_profiles_referral_code ON user_profiles(referral_code);

-- Functions for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, referral_code)
  VALUES (
    NEW.id,
    NEW.email,
    UPPER(SUBSTRING(MD5(NEW.id::text) FROM 1 FOR 8))
  );
  
  -- Initialize checkin streak
  INSERT INTO public.checkin_streaks (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_checkin_streaks_updated_at
  BEFORE UPDATE ON checkin_streaks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample quotes data
INSERT INTO quotes (text, author, category) VALUES
('The only way to do great work is to love what you do.', 'Steve Jobs', 'motivation'),
('Life is what happens to you while you''re busy making other plans.', 'John Lennon', 'life'),
('The future belongs to those who believe in the beauty of their dreams.', 'Eleanor Roosevelt', 'motivation'),
('In the end, we will remember not the words of our enemies, but the silence of our friends.', 'Martin Luther King Jr.', 'wisdom'),
('It is during our darkest moments that we must focus to see the light.', 'Aristotle', 'motivation'),
('Success is not final, failure is not fatal: it is the courage to continue that counts.', 'Winston Churchill', 'motivation'),
('The only impossible journey is the one you never begin.', 'Tony Robbins', 'motivation'),
('Love all, trust a few, do wrong to none.', 'William Shakespeare', 'love'),
('Be yourself; everyone else is already taken.', 'Oscar Wilde', 'wisdom'),
('Two things are infinite: the universe and human stupidity; and I''m not sure about the universe.', 'Albert Einstein', 'wisdom');

-- Insert sample messages data
INSERT INTO messages (text, author, category) VALUES
-- Good Morning Messages
('Good morning! May your day be filled with positive thoughts, kind people, and happy moments.', 'Anonymous', 'good-morning'),
('Wake up and make it happen! Today is full of possibilities waiting for you to discover them.', 'Anonymous', 'good-morning'),
('Good morning sunshine! Remember that every sunrise brings new hope and endless opportunities.', 'Anonymous', 'good-morning'),
('Rise and shine! Today is a blank canvas - paint it with your brightest colors.', 'Anonymous', 'good-morning'),
('Good morning! Start your day with a grateful heart and watch how beautiful life becomes.', 'Anonymous', 'good-morning'),

-- Good Night Messages
('Good night! May your dreams be peaceful and your sleep be restful. Tomorrow awaits with new adventures.', 'Anonymous', 'good-night'),
('As the stars light up the night sky, may your dreams be filled with happiness and wonder.', 'Anonymous', 'good-night'),
('Sleep tight! Let go of today''s worries and embrace the peace that comes with a good night''s rest.', 'Anonymous', 'good-night'),
('Good night, beautiful soul. May you wake up refreshed and ready to conquer tomorrow.', 'Anonymous', 'good-night'),
('Close your eyes and drift away to dreamland, where anything is possible and everything is magical.', 'Anonymous', 'good-night'),

-- Love Messages
('You are my heart, my soul, my treasure, my today, my tomorrow, my forever, my everything.', 'Anonymous', 'love'),
('In your eyes, I found my home. In your heart, I found my love. In your soul, I found my mate.', 'Anonymous', 'love'),
('Love is not about how many days you''ve been together, but how much you love each other every day.', 'Anonymous', 'love'),
('You are the reason I believe in love, the reason I smile without reason, and the reason I am me.', 'Anonymous', 'love'),
('True love doesn''t have an ending. It only grows stronger with each passing moment.', 'Anonymous', 'love'),

-- Romantic Messages
('Every time I see you, I fall in love all over again. You are my forever and always.', 'Anonymous', 'romantic'),
('You are the poetry I never knew how to write and the song I never knew how to sing.', 'Anonymous', 'romantic'),
('In a sea of people, my eyes will always search for you. You are my safe harbor, my home.', 'Anonymous', 'romantic'),
('Your love is like a beautiful melody that plays in my heart every moment of every day.', 'Anonymous', 'romantic'),
('I choose you today, tomorrow, and every day after that. You are my one and only.', 'Anonymous', 'romantic'),

-- Friendship Messages
('A true friend is someone who knows all your flaws and loves you anyway. Thank you for being that friend.', 'Anonymous', 'friendship'),
('Friends are the family we choose for ourselves. I''m grateful to have chosen you.', 'Anonymous', 'friendship'),
('Good friends are like stars. You don''t always see them, but you know they''re always there.', 'Anonymous', 'friendship'),
('Friendship isn''t about being inseparable, but about being separated and knowing nothing changes.', 'Anonymous', 'friendship'),
('A friend is someone who gives you total freedom to be yourself. Thank you for accepting me.', 'Anonymous', 'friendship'),

-- Birthday Messages
('Happy Birthday! May this new year of your life be filled with joy, love, and endless adventures.', 'Anonymous', 'birthday'),
('On your special day, I wish you all the happiness your heart can hold. Happy Birthday!', 'Anonymous', 'birthday'),
('Another year older, another year wiser, another year more amazing. Happy Birthday to you!', 'Anonymous', 'birthday'),
('May your birthday be the start of a year filled with good luck, good health, and much happiness.', 'Anonymous', 'birthday'),
('Happy Birthday! May all your dreams and wishes come true in the year ahead.', 'Anonymous', 'birthday'),

-- Encouragement Messages
('You are stronger than you think, braver than you feel, and more capable than you imagine.', 'Anonymous', 'encouragement'),
('Don''t give up! Every great accomplishment starts with the decision to keep going.', 'Anonymous', 'encouragement'),
('Believe in yourself as much as I believe in you. You have the power to overcome anything.', 'Anonymous', 'encouragement'),
('Difficult roads often lead to beautiful destinations. Keep moving forward!', 'Anonymous', 'encouragement'),
('You''ve survived 100% of your worst days so far. You''re stronger than you know.', 'Anonymous', 'encouragement'),

-- Thank You Messages
('Thank you for being the reason I smile, the reason I try, and the reason I believe in good people.', 'Anonymous', 'thank-you'),
('Your kindness has touched my heart in ways you''ll never know. Thank you for being you.', 'Anonymous', 'thank-you'),
('Gratitude makes sense of our past, brings peace for today, and creates a vision for tomorrow. Thank you!', 'Anonymous', 'thank-you'),
('Thank you for being a constant source of support, joy, and inspiration in my life.', 'Anonymous', 'thank-you'),
('Words cannot express how grateful I am for everything you''ve done. Thank you from the bottom of my heart.', 'Anonymous', 'thank-you'),

-- Apology Messages
('I''m truly sorry for my mistakes. I value our relationship and hope you can forgive me.', 'Anonymous', 'apology'),
('I sincerely apologize for hurting you. Your feelings matter to me, and I want to make things right.', 'Anonymous', 'apology'),
('Sorry isn''t just a word - it''s a promise to do better. I promise to learn from this mistake.', 'Anonymous', 'apology'),
('I was wrong, and I take full responsibility for my actions. Please give me a chance to make amends.', 'Anonymous', 'apology'),
('Your forgiveness would mean the world to me. I''m sorry for disappointing you.', 'Anonymous', 'apology');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Success message
SELECT 'Boomquotes comprehensive database setup completed successfully!' as message;