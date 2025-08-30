# Authentication Setup Guide

This polling app uses Supabase for user authentication with email verification. Follow these steps to set up authentication:

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new account or sign in
2. Create a new project
3. Wait for the project to be set up

## 2. Get Your Supabase Credentials

1. In your Supabase dashboard, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **anon public** key (starts with `eyJ`)

## 3. Set Up Environment Variables

Create a `.env.local` file in the root of your project with the following content:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

Replace `your_project_url_here` and `your_anon_key_here` with the actual values from your Supabase project.

## 4. Configure Supabase Authentication

1. In your Supabase dashboard, go to **Authentication** > **Settings**
2. Under **Site URL**, add your development URL (e.g., `http://localhost:3000`)
3. Under **Redirect URLs**, add:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/login`
   - `http://localhost:3000/register`
   - `http://localhost:3000/verify-email`

## 5. Enable Email Verification

1. Go to **Authentication** > **Settings**
2. Under **Email Auth**, make sure **Enable email confirmations** is checked
3. Configure email templates (optional but recommended)

## 6. Email Templates (Recommended)

1. Go to **Authentication** > **Email Templates**
2. Customize the email templates for:
   - **Confirm signup**: Welcome users and provide clear verification instructions
   - **Reset password**: Help users reset their password securely
   - **Magic link**: For passwordless authentication (optional)

### Sample Email Template Content:

**Confirm signup template:**

```
Subject: Verify your email address - Polling App

Hi there,

Thanks for signing up for Polling App! Please click the link below to verify your email address:

[Confirm your email address]({{ .ConfirmationURL }})

This link will expire in 24 hours.

If you didn't create an account, you can safely ignore this email.

Best regards,
The Polling App Team
```

## 7. Start the Development Server

```bash
npm run dev
```

## Features

- **User Registration**: Users can create accounts with email and password
- **Email Verification**: Automatic email verification with resend functionality
- **User Login**: Secure authentication with email and password
- **Protected Routes**: Automatic redirection for unauthenticated users
- **User Profile**: Display user information and logout functionality
- **Form Validation**: Client-side validation with Zod
- **Toast Notifications**: User feedback for authentication actions
- **Middleware Protection**: Server-side route protection
- **Email Verification Page**: Dedicated page for email verification

## Authentication Flow

1. **Registration**: Users sign up with email, password, and full name
2. **Email Verification**: Users receive a verification email with a link
3. **Email Confirmation**: Users click the link to verify their email
4. **Login**: Users sign in with email and password (only after verification)
5. **Session Management**: Automatic session handling with cookies
6. **Logout**: Users can sign out and are redirected to login page

## Email Verification Flow

1. **User registers** → Verification email sent automatically
2. **User clicks email link** → Redirected to `/auth/callback`
3. **Email verified** → User redirected to `/polls`
4. **Email not verified** → User redirected to `/login` with error message
5. **Resend verification** → Users can request new verification emails

## Components

- `AuthProvider`: Context provider for authentication state
- `LoginForm`: Form component for user login with email verification reminder
- `RegisterForm`: Form component for user registration with email verification flow
- `EmailVerificationForm`: Component for resending verification emails
- `UserProfile`: Component for displaying user info and logout
- `ProtectedRoute`: Wrapper for protecting routes

## Routes

- `/login` - User login page
- `/register` - User registration page
- `/verify-email` - Email verification page
- `/auth/callback` - Authentication callback handler
- `/polls` - Protected dashboard (requires authentication)

## Middleware

The app includes middleware that:

- Redirects unauthenticated users to `/login`
- Redirects authenticated users away from public routes (`/login`, `/register`, `/verify-email`)
- Handles session refresh automatically
- Protects all routes except public ones

## Security Features

- Server-side authentication checks
- Secure cookie handling
- Form validation and sanitization
- Protected API routes
- Automatic session management
- Email verification requirement
- CSRF protection via Supabase

## Testing the Setup

1. **Register a new user**:

   - Go to `/register`
   - Fill out the form
   - Check your email for verification link

2. **Verify email**:

   - Click the verification link in your email
   - You should be redirected to `/polls`

3. **Login**:

   - Go to `/login`
   - Sign in with your credentials
   - You should be redirected to `/polls`

4. **Test protected routes**:

   - Try accessing `/polls` without being logged in
   - You should be redirected to `/login`

5. **Test email verification**:
   - Go to `/verify-email`
   - Request a new verification email
   - Check your email for the new link

## Troubleshooting

### Email not received:

- Check spam folder
- Verify email address is correct
- Check Supabase email settings
- Try resending from `/verify-email`

### Verification link not working:

- Check redirect URLs in Supabase settings
- Ensure environment variables are correct
- Check browser console for errors

### Login issues:

- Make sure email is verified
- Check password is correct
- Verify Supabase project is active
- Check network connectivity
