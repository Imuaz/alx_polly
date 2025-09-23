"use client";

/**
 * Login Form Component
 *
 * Provides user authentication interface with:
 * - Email and password input fields with validation
 * - Loading states and error handling
 * - Email verification reminders
 * - Responsive design with modern UI
 * - Integration with Supabase authentication
 * - Client-side cache invalidation after login
 */

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import { toast } from "sonner";
import { AlertCircle, Mail, Lock, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

interface LoginFormProps extends React.ComponentProps<typeof Card> {}

export function LoginForm({ className, ...props }: LoginFormProps) {
  const router = useRouter();
  const { signIn, loading } = useAuth();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  /**
   * Handles form submission for user login
   *
   * @param event - Form submission event
   *
   * Features:
   * - Uses auth context for better state management
   * - Handles client-side authentication
   * - Provides specific error messages for common issues
   * - Lets middleware handle redirects to prevent conflicts
   */
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(event.currentTarget);
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;

      if (!email || !password) {
        toast.error("Please fill in all fields.");
        return;
      }

      const { error } = await signIn(email, password);
      
      if (error) {
        // Provide user-friendly error messages for common scenarios
        if (error.message?.includes("Email not confirmed")) {
          toast.error(
            "Please verify your email address before signing in. Check your inbox for a verification link.",
          );
        } else if (error.message?.includes("Invalid login credentials")) {
          toast.error("Invalid email or password. Please try again.");
        } else {
          toast.error(error.message || "Failed to sign in");
        }
      } else {
        toast.success("Signed in successfully");
        // Let the auth context and middleware handle the redirect
        router.push("/polls");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card
      className={`shadow-lg sm:shadow-xl border border-slate-200/50 dark:border-slate-700/50 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm ${className}`}
      {...props}
    >
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-2 sm:space-y-3 pt-3 sm:pt-4 px-3 sm:px-4">
          <div className="space-y-1">
            <Label htmlFor="email" className="text-sm font-medium">
              Email address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                className="pl-10 h-10 sm:h-11 border-2 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-base sm:text-sm"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                className="pl-10 h-10 sm:h-11 border-2 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-base sm:text-sm"
                required
                minLength={6}
              />
            </div>
          </div>

          {/* Compact email verification reminder */}
          <div className="flex items-center gap-2 p-2 sm:p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <div className="text-xs text-blue-700 dark:text-blue-300">
              <span className="font-medium">Email verification required.</span>
              <Link
                href="/verify-email"
                className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-medium hover:underline transition-colors"
              >
                Verify here
              </Link>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-2 sm:pt-3 px-3 sm:px-4">
          <Button
            className="w-full h-11 sm:h-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-medium text-base sm:text-sm"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
