# Polling App with QR Code Sharing

A modern, full-stack polling application built with Next.js and Supabase that allows users to create, share, and vote on polls with real-time results and QR code sharing capabilities.

## 🚀 Features

- **User Authentication**: Secure registration and login with email verification
- **Poll Creation**: Create polls with multiple options and customizable settings
- **Voting System**: Support for single-choice and multiple-choice voting
- **Real-time Results**: Live vote counting with animated progress bars
- **Poll Sharing**: Share polls via direct links and QR codes
- **User Dashboard**: Manage your polls and view voting statistics
- **Responsive Design**: Modern UI that works on all devices
- **Anonymous Voting**: Optional anonymous voting for privacy

## 🛠️ Technology Stack

- **Framework**: [Next.js 14](https://nextjs.org) with App Router
- **Database & Auth**: [Supabase](https://supabase.com)
- **Styling**: [Tailwind CSS](https://tailwindcss.com) with [shadcn/ui](https://ui.shadcn.com)
- **Language**: TypeScript
- **State Management**: React Server Components + Client Components
- **Form Handling**: Next.js Server Actions
- **QR Codes**: qrcode.react library

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js 18.0 or later
- npm, yarn, pnpm, or bun
- A Supabase account and project

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd alx-polly
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SECRET_KEY=your_supabase_secret_key

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Supabase Setup

1. Create a new project in [Supabase](https://supabase.com)
2. Run the database schema from `supabase-schema.sql`
3. Set up authentication providers (email/password is enabled by default)
4. Configure email templates for verification (optional)

### 5. Database Schema

The application uses the following main tables:

- `profiles` - User profile information
- `polls` - Poll metadata and settings
- `poll_options` - Individual poll choices
- `poll_votes` - User votes (with foreign key constraints)

Refer to `supabase-schema.sql` for the complete schema.

## 🚀 Running the Application

### Development Mode

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Environment & Supabase Setup

1. Create `.env.local` with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SECRET_KEY=your_supabase_secret_key
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

2. Apply database migrations in Supabase SQL Editor (or CLI):

- `migrations/0002_add_user_roles.sql` (roles + RLS)
- `migrations/0003_add_email_to_profiles.sql` (email on profiles)
- `migrations/0004_create_poll_shares.sql` (share analytics + RLS)

3. Configure Auth (Email/Password enabled) and set Redirect URL to `${NEXT_PUBLIC_SITE_URL}/auth/callback`.

4. Optional: seed admin role using Supabase SQL (set `profiles.role = 'admin'`).

### Production Build

```bash
npm run build
npm start
```

## 📖 Usage Guide

### Creating Your First Poll

1. **Register/Login**: Create an account or sign in to an existing one
2. **Navigate to Create Poll**: Click "Create Poll" from the dashboard
3. **Fill Poll Details**:
   - Enter a descriptive title
   - Add an optional description
   - Select a category
   - Set an optional end date
4. **Add Options**: Add at least 2 poll options (you can add more)
5. **Configure Settings**:
   - Enable "Allow Multiple Votes" for multi-choice polls
   - Enable "Anonymous Voting" to hide voter identities
6. **Create Poll**: Submit the form to create your poll

### Voting on Polls

1. **Browse Polls**: View available polls on the main polls page
2. **Select Poll**: Click on a poll to view details
3. **Make Selection**: Choose your option(s) based on poll settings
4. **Submit Vote**: Click "Vote" to submit your choice
5. **View Results**: See real-time results with vote percentages

### Sharing Polls

1. **Open Poll**: Navigate to any poll page
2. **Share Options**:
   - Copy the direct link
   - Share on social media (Twitter, Facebook, LinkedIn)
   - Generate QR code for mobile sharing
3. **Track Engagement**: Monitor vote counts and sharing statistics (Shares today, Total shares)

### Managing Your Polls

1. **Dashboard**: Access your dashboard to see all created polls
2. **View Statistics**: See vote counts and engagement metrics
3. **Poll Status**: Monitor active vs. ended polls
4. **Delete Polls**: Remove polls you no longer need

## 🧪 Testing

Run the test suite:

```bash
npm test
# or
yarn test
```

Run tests in watch mode:

```bash
npm run test:watch
```

## 📁 Project Structure

```
alx-polly/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Dashboard pages
│   ├── polls/             # Poll-related pages
│   └── auth/              # Auth callback handling
├── components/            # Reusable UI components
│   ├── auth/              # Authentication components
│   ├── layout/            # Layout components
│   ├── polls/             # Poll-specific components
│   └── ui/                # shadcn/ui components
├── lib/                   # Utility functions and actions
│   ├── auth/              # Authentication actions
│   ├── polls/             # Poll management actions
│   └── types/             # TypeScript type definitions
├── public/                # Static assets
└── scripts/               # Utility scripts
```

## 🔒 Security Features

- **Authentication**: Secure user authentication with Supabase Auth
- **Authorization**: Row-level security (RLS) policies in Supabase
- **Input Validation**: Server-side validation for all form inputs
- **CSRF Protection**: Built-in protection with Next.js Server Actions
- **Environment Variables**: Sensitive data stored in environment variables

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark Mode**: System preference detection and manual toggle
- **Loading States**: Smooth loading indicators and skeleton screens
- **Error Handling**: User-friendly error messages and fallbacks
- **Accessibility**: WCAG compliant with proper ARIA labels

## 🤖 AI Usage (Tools and Context)

- Development assistance leveraged AI for code generation and refactoring with context on:
  - Next.js App Router best practices (Server Components, Server Actions)
  - Supabase SSR client usage and RLS-safe queries
  - Error handling and redirect patterns (handling `NEXT_REDIRECT` digest)
  - QR code integration (`qrcode.react`) and analytics design
- Tools used in-editor: code search, lints, and automated edits; no secrets were hardcoded.
- All database keys are loaded via environment variables.

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your repository to [Vercel](https://vercel.com)
2. Set environment variables in Vercel dashboard
3. Deploy automatically on every push to main branch

### Production Readiness Notes

- Environment variables set in hosting provider (same as `.env.local`).
- Ensure middleware allows public access to `/polls` and `/auth/callback` for QR usage.
- Confirm DB migrations applied and RLS policies enabled.
- Confirm `poll_shares` table exists and policies applied for anonymous inserts/selects.
- Set `NEXT_PUBLIC_SITE_URL` to production domain for correct email redirects and QR URLs.

### Other Platforms

The app can be deployed to any platform that supports Next.js:

- Netlify
- Railway
- Render
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the existing documentation
2. Search through existing issues
3. Create a new issue with detailed information
4. Join our community discussions

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) for the amazing React framework
- [Supabase](https://supabase.com) for the backend infrastructure
- [shadcn/ui](https://ui.shadcn.com) for the beautiful UI components
- [Tailwind CSS](https://tailwindcss.com) for the utility-first styling

---

**Happy Polling! 🗳️**
