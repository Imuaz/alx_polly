import { Metadata } from "next"
import { PollsGrid } from "@/components/polls/polls-grid"
import { PollsFilters } from "@/components/polls/polls-filters"
import { CreatePollButton } from "@/components/polls/create-poll-button"
import { UserProfile } from "@/components/auth/user-profile"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { EmailVerificationBanner } from "@/components/auth/email-verification-banner"
import { BarChart3, TrendingUp, Users } from "lucide-react"

export const metadata: Metadata = {
  title: "Polls | Polling App",
  description: "Browse and vote on polls created by the community",
}

export default function PollsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto py-8 space-y-8">
          <EmailVerificationBanner />
          
          {/* Header Section */}
          <div className="relative">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-3xl blur-3xl" />
            
            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 shadow-xl">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
                      <BarChart3 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
                        Polls Dashboard
                      </h1>
                      <p className="text-lg text-muted-foreground">
                        Discover and participate in polls from the community
                      </p>
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="flex flex-wrap gap-4 pt-2">
                    <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                      <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Active Polls</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                      <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Community</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <CreatePollButton />
                  <UserProfile />
                </div>
              </div>
            </div>
          </div>
          
          {/* Filters Section */}
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-lg">
            <PollsFilters />
          </div>
          
          {/* Polls Grid */}
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-lg">
            <PollsGrid />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
