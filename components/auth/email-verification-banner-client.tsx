"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, Mail, X, CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { resendVerificationAction } from "@/lib/auth/actions";
import { User } from "@supabase/supabase-js";

interface EmailVerificationBannerClientProps {
  user: User;
}

export function EmailVerificationBannerClient({
  user,
}: EmailVerificationBannerClientProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isResending, setIsResending] = useState(false);

  if (isDismissed) {
    return null;
  }

  const handleResendVerification = async () => {
    if (!user.email) return;

    setIsResending(true);
    try {
      const formData = new FormData();
      formData.append("email", user.email);

      await resendVerificationAction(formData);
      toast.success("Verification email sent successfully!");
    } catch (error) {
      console.error("Resend verification error:", error);
      toast.error("Failed to send verification email. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 dark:border-amber-800 dark:from-amber-950/50 dark:to-yellow-950/50 p-6 shadow-lg">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-100/20 to-yellow-100/20 dark:from-amber-900/10 dark:to-yellow-900/10" />

      <div className="relative flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-amber-900 dark:text-amber-100">
                Verify your email address
              </h3>
              <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                Please verify your email address to unlock all features and ensure your account security.
                Check your inbox for a verification link from us.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDismissed(true)}
              className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button
              onClick={handleResendVerification}
              disabled={isResending}
              size="sm"
              className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Mail className="h-4 w-4 mr-2" />
              {isResending ? "Sending..." : "Resend verification"}
            </Button>
            <Link
              href="/verify-email"
              className="inline-flex items-center text-sm text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 font-medium hover:underline transition-colors"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Verify email page
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-200/20 to-transparent dark:from-amber-800/20 rounded-full -translate-y-16 translate-x-16" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-yellow-200/20 to-transparent dark:from-yellow-800/20 rounded-full translate-y-12 -translate-x-12" />
    </div>
  );
}
