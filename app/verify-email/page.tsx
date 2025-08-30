import { Metadata } from "next"
import { EmailVerificationForm } from "@/components/auth/email-verification-form"

export const metadata: Metadata = {
  title: "Verify Email | Polling App",
  description: "Verify your email address to complete your account setup",
}

export default function VerifyEmailPage() {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <a href="/">Polling App</a>
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              "Complete your account setup by verifying your email address to start creating and voting on polls."
            </p>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Verify your email
            </h1>
            <p className="text-sm text-muted-foreground">
              Check your email and click the verification link to complete your account setup
            </p>
          </div>
          <EmailVerificationForm />
        </div>
      </div>
    </div>
  )
}
