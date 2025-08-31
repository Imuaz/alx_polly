"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"
import { toast } from "sonner"
import { AlertCircle, Mail, Lock, ArrowRight } from "lucide-react"
import { signInAction } from "@/lib/auth/actions"

interface LoginFormProps extends React.ComponentProps<typeof Card> {}

export function LoginForm({ className, ...props }: LoginFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    
    try {
      await signInAction(formData)
      toast.success("Signed in successfully")
    } catch (error) {
      console.error("Sign in error:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to sign in"
      
      // Handle specific error cases
      if (errorMessage.includes('Email not confirmed')) {
        toast.error("Please verify your email address before signing in. Check your inbox for a verification link.")
      } else if (errorMessage.includes('Invalid login credentials')) {
        toast.error("Invalid email or password. Please try again.")
      } else {
        toast.error(errorMessage)
      }
      setIsLoading(false)
    }
  }

  return (
    <Card className={`shadow-xl border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 ${className}`} {...props}>
      <CardHeader className="space-y-3 pb-6">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mb-2">
          <Icons.logo className="h-6 w-6 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
          Welcome back
        </CardTitle>
        <CardDescription className="text-center text-muted-foreground">
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <form action={handleSubmit}>
        <CardContent className="space-y-4">
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
                className="pl-10 h-11 border-2 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
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
                placeholder="Enter your password"
                className="pl-10 h-11 border-2 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                required
                minLength={6}
              />
            </div>
          </div>
          
          {/* Email verification reminder */}
          <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <p className="font-medium mb-1">Email verification required</p>
              <p className="mb-2">Make sure to verify your email address before signing in.</p>
              <Link 
                href="/verify-email" 
                className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-medium hover:underline transition-colors"
              >
                Need to verify your email?
                <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-6">
          <Button 
            className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-medium" 
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
  )
}
