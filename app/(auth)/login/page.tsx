import { Metadata } from "next"
import Link from "next/link"
import { LoginForm } from "@/components/auth/login-form"
import { AuthLayout } from "@/components/auth/auth-layout"
import { LoginSidePanel } from "@/components/auth/login-side-panel"
import { AuthGuard } from "@/components/auth/auth-guard"

export const metadata: Metadata = {
  title: "Login | Polling App",
  description: "Login to your account to create and vote on polls",
}

export default function LoginPage() {
  return (
    <AuthGuard>
      <AuthLayout backgroundType="login" sidePanel={<LoginSidePanel />}>
        <div className="flex flex-col space-y-1 text-center mb-2 lg:mb-3">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Enter your credentials to access your account
          </p>
        </div>
        <LoginForm />
        <p className="text-center text-sm text-muted-foreground mt-3 sm:mt-4">
          <Link
            href="/register"
            className="hover:text-brand underline underline-offset-4 py-1 px-1 inline-block"
          >
            Don&apos;t have an account? Sign up
          </Link>
        </p>
      </AuthLayout>
    </AuthGuard>
  )
}
