"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"
import { toast } from "sonner"
import { CheckCircle, Mail, User, Lock, Shield, ArrowRight, Sparkles } from "lucide-react"
import { signUpAction, resendVerificationAction } from "@/lib/auth/actions"

interface RegisterFormProps extends React.ComponentProps<typeof Card> {}

export function RegisterForm({ className, ...props }: RegisterFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [isEmailConfirmationSent, setIsEmailConfirmationSent] = React.useState<boolean>(false)
  const [registeredEmail, setRegisteredEmail] = React.useState<string>("")

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    
    try {
      const email = formData.get("email") as string
      const password = formData.get("password") as string
      const confirmPassword = formData.get("confirmPassword") as string
      
      // Client-side validation
      if (password !== confirmPassword) {
        toast.error("Passwords don't match")
        setIsLoading(false)
        return
      }
      
      await signUpAction(formData)
      setRegisteredEmail(email)
      setIsEmailConfirmationSent(true)
      toast.success("Account created successfully! Please check your email to verify your account.")
    } catch (error) {
      console.error("Sign up error:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to create account"
      toast.error(errorMessage)
      setIsLoading(false)
    }
  }

  const handleResendVerification = async () => {
    if (!registeredEmail) return
    
    try {
      const formData = new FormData()
      formData.append("email", registeredEmail)
      await resendVerificationAction(formData)
      toast.success("Verification email sent successfully!")
    } catch (error) {
      toast.error("Failed to resend verification email")
    }
  }

  // Show email verification message if confirmation was sent
  if (isEmailConfirmationSent) {
    return (
      <Card className={`shadow-xl border-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 ${className}`} {...props}>
        <CardHeader className="space-y-3 pb-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 mx-auto mb-2">
            <CheckCircle className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-green-900 to-emerald-700 dark:from-green-100 dark:to-emerald-300 bg-clip-text text-transparent">
            Check your email
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            We've sent a verification link to your email address
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg border border-green-200 dark:border-green-800">
            <Mail className="h-5 w-5 text-green-600 dark:text-green-400" />
            <div>
              <p className="font-medium text-green-900 dark:text-green-100">{registeredEmail}</p>
              <p className="text-sm text-green-700 dark:text-green-300">
                Click the link in the email to verify your account
              </p>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground space-y-2">
            <p className="flex items-center gap-2">
              <Sparkles className="h-3 w-3" />
              Check your spam folder if you don't see the email
            </p>
            <p className="flex items-center gap-2">
              <Shield className="h-3 w-3" />
              The verification link will expire in 24 hours
            </p>
            <p className="flex items-center gap-2">
              <Mail className="h-3 w-3" />
              You can request a new verification email below
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 pt-6">
          <Button 
            onClick={handleResendVerification}
            variant="outline" 
            className="w-full h-11 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-950/30"
          >
            <Mail className="mr-2 h-4 w-4" />
            Resend verification email
          </Button>
          <Button 
            onClick={() => window.location.reload()}
            variant="ghost" 
            className="w-full h-11"
          >
            Back to registration
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className={`shadow-xl border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 ${className}`} {...props}>
      <CardHeader className="space-y-3 pb-6">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 mx-auto mb-2">
          <Icons.logo className="h-6 w-6 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
          Create an account
        </CardTitle>
        <CardDescription className="text-center text-muted-foreground">
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <form action={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-medium">
              Full Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Enter your full name"
                className="pl-10 h-11 border-2 transition-all duration-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                required
                minLength={2}
              />
            </div>
          </div>
          
          <div className="space-y-2">
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
                className="pl-10 h-11 border-2 transition-all duration-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                id="password" 
                name="password"
                type="password" 
                placeholder="Create a password"
                className="pl-10 h-11 border-2 transition-all duration-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                required
                minLength={6}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm Password
            </Label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                id="confirmPassword" 
                name="confirmPassword"
                type="password" 
                placeholder="Confirm your password"
                className="pl-10 h-11 border-2 transition-all duration-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                required
                minLength={6}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-6">
          <Button 
            className="w-full h-11 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-medium" 
            type="submit" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                Create Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
