# Database Setup Guide

## Setting up Supabase Database Schema

Follow these steps to create the required database tables and functions for the Polling App:

### 1. Access Supabase SQL Editor

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**

### 2. Run the Schema Script

1. Copy the entire contents of `supabase-schema.sql`
2. Paste it into the SQL Editor
3. Click **Run** to execute the script

### 3. Verify Tables Creation

After running the script, verify these tables were created:

- `profiles` - User profile information
- `polls` - Main polls table
- `poll_options` - Poll voting options
- `poll_votes` - Individual votes cast by users

### 4. Check Row Level Security (RLS)

The script automatically enables RLS and creates policies for:
- Public read access to polls and options
- User-specific write permissions
- Vote tracking and validation

### 5. Environment Variables

Ensure your `.env.local` file contains:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SECRET_KEY=your_supabase_service_role_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 6. Test the Setup

1. Start your development server: `npm run dev`
2. Register a new user account
3. Try creating a poll
4. Test voting functionality

### Database Schema Overview

#### Tables Structure:

**profiles**
- `id` (UUID, references auth.users)
- `full_name` (TEXT)
- `avatar_url` (TEXT)
- `created_at`, `updated_at` (TIMESTAMP)

**polls**
- `id` (UUID, primary key)
- `title`, `description` (TEXT)
- `category`, `status` (TEXT)
- `created_by` (UUID, references auth.users)
- `total_votes` (INTEGER)
- `allow_multiple_votes`, `anonymous_voting` (BOOLEAN)
- `created_at`, `updated_at`, `ends_at` (TIMESTAMP)

**poll_options**
- `id` (UUID, primary key)
- `poll_id` (UUID, references polls)
- `text` (TEXT)
- `votes` (INTEGER)
- `order_index` (INTEGER)

**poll_votes**
- `id` (UUID, primary key)
- `poll_id`, `option_id` (UUID, references)
- `user_id` (UUID, references auth.users)
- `ip_address` (INET)
- `created_at` (TIMESTAMP)

### Automatic Features

The schema includes:
- **Auto vote counting** - Triggers update vote counts automatically
- **Profile creation** - New user profiles created on signup
- **Timestamp updates** - `updated_at` fields auto-updated
- **Data integrity** - Foreign key constraints and unique constraints
- **Security** - RLS policies for data access control

### Troubleshooting

If you encounter issues:

1. **Permission errors**: Check RLS policies are correctly applied
2. **Foreign key errors**: Ensure user is authenticated when creating polls
3. **Vote counting issues**: Verify triggers are active
4. **Connection errors**: Check environment variables

Run this query to check if tables exist:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'polls', 'poll_options', 'poll_votes');
```
