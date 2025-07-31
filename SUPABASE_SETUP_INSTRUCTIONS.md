# Supabase Setup Instructions for Boomquotes

## Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Choose a project name: "boomquotes"
3. Set a strong database password and save it securely
4. Wait for the project to be created (2-3 minutes)

## Step 2: Get Database Connection URL
1. In your Supabase dashboard, click "Connect" in the top toolbar
2. Go to "Connection string" → "Transaction pooler"
3. Copy the URI value (it looks like: `postgresql://postgres.xxxxx:password@aws-0-region.pooler.supabase.com:6543/postgres`)
4. Replace `[YOUR-PASSWORD]` with your actual database password

## Step 3: Set up Database Schema
1. In Supabase dashboard, go to "SQL Editor"
2. Copy the entire contents from `supabase_schema.sql` file in this project
3. Paste it into the SQL Editor and click "Run"
4. This will create all tables, functions, triggers, and security policies

## Step 4: Configure Environment Variables
Add this environment variable to your Replit project:
```
DATABASE_URL=your_supabase_connection_string_here
```

## Step 5: Test the Connection
1. Restart the application
2. The app should now connect to your Supabase database
3. Try creating an account and using the check-in system

## Step 6: Deploy to Vercel
1. Connect your Replit project to GitHub
2. Import the project to Vercel
3. Add the DATABASE_URL environment variable in Vercel settings
4. Deploy the application

## Database Tables Created:
- `user_profiles` - User account information with referral codes
- `quotes` - Inspirational quotes database
- `favorites` - User bookmarked quotes
- `check_ins` - Daily check-in tracking with button clicks
- `checkin_streaks` - User streak statistics
- `airtime_rewards` - ₦500 rewards and referral earnings
- `referrals` - Referral tracking and validation

## Key Features:
- Automatic user profile creation on signup
- Referral code generation (BOOM + 6 digits)
- Streak tracking with automatic reward generation
- Referral validation (₦100 after 10-day minimum)
- Combined withdrawal system (check-in + referral earnings)
- Row Level Security (RLS) for data protection

## Security:
All tables have Row Level Security enabled, ensuring users can only access their own data. The database includes proper indexes for performance and triggers for automatic data management.