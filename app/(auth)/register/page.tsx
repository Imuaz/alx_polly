import { Metadata } from "next"
import Link from "next/link"
import { RegisterForm } from "@/components/auth/register-form"
import { AuthLayout } from "@/components/auth/auth-layout"
import { RegisterSidePanel } from "@/components/auth/register-side-panel"
import { AuthGuard } from "@/components/auth/auth-guard"

export const metadata: Metadata = {
  title: "Register | Polling App",
  description: "Create a new account to start creating and voting on polls",
}

export default function RegisterPage() {
  return (
    <AuthGuard>
      <AuthLayout backgroundType="register" sidePanel={<RegisterSidePanel />}>
        <div className="flex flex-col space-y-1 text-center mb-2 lg:mb-3">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold tracking-tight">
            Create an account
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Enter your information below to create your account
          </p>
        </div>
        <RegisterForm />
        <p className="text-center text-sm text-muted-foreground mt-3 sm:mt-4">
          <Link
            href="/login"
            className="hover:text-brand underline underline-offset-4 py-1 px-1 inline-block"
          >
            Already have an account? Sign in
          </Link>
        </p>
      </AuthLayout>
    </AuthGuard>
  )
}
