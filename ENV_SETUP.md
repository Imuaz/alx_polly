# Environment Variables Setup

To fix the runtime error and get the authentication system working, you need to set up your environment variables.

## Quick Setup

1. **Create a `.env.local` file** in the root of your project (same level as `package.json`)

2. **Add the following content** to your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

3. **Replace the placeholder values** with your actual Supabase credentials:
   - Get your project URL from Supabase Dashboard → Settings → API
   - Get your anon key from Supabase Dashboard → Settings → API

## Example `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzNjU2NzI5MCwiZXhwIjoxOTUyMTQzMjkwfQ.example
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## After Setup

1. **Restart your development server**:

   ```bash
   npm run dev
   ```

2. **The runtime error should be resolved** and the authentication system will work properly.

## Getting Supabase Credentials

1. Go to [supabase.com](https://supabase.com)
2. Create a new project or select an existing one
3. Go to **Settings** → **API**
4. Copy the **Project URL** and **anon public** key
5. Paste them in your `.env.local` file

## Troubleshooting

- **Make sure the file is named exactly `.env.local`** (with the dot at the beginning)
- **Restart your development server** after creating the file
- **Check the browser console** for any remaining errors
- **Verify your Supabase project is active** and the credentials are correct
