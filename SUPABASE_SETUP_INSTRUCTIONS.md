# Supabase Database Setup for Boomquotes

## Quick Setup Instructions

1. **Open your Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project: `qkcqmkecckojkvmxkmzq`

2. **Run the SQL Setup**
   - Go to the "SQL Editor" tab
   - Create a new query
   - Copy and paste the entire contents of `supabase_setup.sql`
   - Click "Run" to execute all commands

## What This Creates

### Core Tables
- **user_profiles** - User information including Nigerian status
- **quotes** - Inspirational quotes with categories
- **favorites** - User's saved quotes
- **daily_checkins** - Track 5-click daily check-ins with 2-minute intervals
- **checkin_streaks** - User streak tracking
- **rewards** - Airtime rewards for 30-day streaks (Nigerians only)
- **reward_claims** - Track all reward payouts

### Daily Check-in Logic
- Users must click 5 times with 2-minute cooldowns between clicks
- Each click triggers an ad view
- After 5 clicks, the daily check-in is marked complete
- 30 consecutive days = ₦500 airtime reward for Nigerian users

### Key Functions Created
- `handle_checkin_click(user_id)` - Processes each click with cooldown
- `get_checkin_status(user_id)` - Gets current check-in status
- `update_user_streak(user_id)` - Updates streak counters
- `check_reward_eligibility(user_id)` - Creates rewards for 30-day streaks

### Row Level Security
- All tables have RLS enabled
- Users can only access their own data
- Quotes are publicly readable for authenticated users

## Testing the Setup

After running the SQL, you can test with these queries:

```sql
-- Check if tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_profiles', 'daily_checkins', 'rewards');

-- Test check-in function (replace with real user ID)
SELECT handle_checkin_click('your-user-uuid-here');

-- Check check-in status
SELECT get_checkin_status('your-user-uuid-here');
```

## Next Steps

1. Run the SQL setup in Supabase
2. Update your application to use these new database functions
3. Implement the ad integration for each click
4. Set up airtime payout system for Nigerian users
5. Test the complete flow from registration to reward claim

The database is now ready to handle the full check-in system with ads and rewards!