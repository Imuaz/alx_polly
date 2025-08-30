"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { Mail, CheckCircle } from "lucide-react"

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

type EmailFormData = z.infer<typeof emailSchema>

export function EmailVerificationForm() {
  const { resendVerificationEmail } = useAuth()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [emailSent, setEmailSent] = React.useState<boolean>(false)
  const [sentEmail, setSentEmail] = React.useState<string>("")

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  })

  async function onSubmit(data: EmailFormData) {
    setIsLoading(true)
    
    try {
      const { error } = await resendVerificationEmail(data.email)
      
      if (error) {
        toast.error("Failed to send verification email. Please try again.")
      } else {
        setSentEmail(data.email)
        setEmailSent(true)
        toast.success("Verification email sent successfully!")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (emailSent) {
    return (
      <Card>
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <CardTitle className="text-2xl">Email sent!</CardTitle>
          </div>
          <CardDescription>
            We've sent a verification link to your email address
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">{sentEmail}</p>
              <p className="text-sm text-muted-foreground">
                Click the link in the email to verify your account
              </p>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground space-y-2">
            <p>• Check your spam folder if you don't see the email</p>
            <p>• The verification link will expire in 24 hours</p>
            <p>• After verification, you can sign in to your account</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button 
            onClick={() => setEmailSent(false)}
            variant="outline" 
            className="w-full"
          >
            Send to a different email
          </Button>
          <Button 
            onClick={() => window.location.href = '/login'}
            className="w-full"
          >
            Back to sign in
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Resend verification email</CardTitle>
        <CardDescription>
          Enter your email address to receive a new verification link
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              {...register("email")}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Send verification email
          </Button>
          <Button 
            onClick={() => window.location.href = '/login'}
            variant="ghost" 
            className="w-full"
          >
            Back to sign in
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
