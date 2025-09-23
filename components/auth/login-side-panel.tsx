import React from 'react'
import { BarChart3, TrendingUp, Users, Sparkles, Zap } from 'lucide-react'

export function LoginSidePanel() {
  return (
    <div className="space-y-6 lg:space-y-8 auth-side-panel">
      {/* Enhanced header with floating elements */}
      <div className="relative space-y-4">
        {/* Floating decorative elements */}
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-400/20 rounded-full blur-sm animate-float-gentle" />
        <div className="absolute top-8 -left-1 w-4 h-4 bg-indigo-400/15 rounded-full blur-sm animate-pulse-glow" style={{ animationDelay: '0.5s' }} />
        
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-blue-200 bg-clip-text text-transparent animate-text-glow auth-text-responsive leading-tight">
          Welcome back to your
          <span className="block text-blue-300 animate-counter-up flex items-center gap-2">
            data-driven insights
            <Sparkles className="h-6 w-6 lg:h-8 lg:w-8 text-blue-400 animate-bounce" style={{ animationDelay: '1s' }} />
          </span>
        </h2>
        <p className="text-base md:text-lg lg:text-xl text-blue-100 leading-relaxed auth-subtitle-responsive max-w-md">
          Continue creating meaningful polls and gathering valuable insights from your community.
        </p>
      </div>
      
      {/* Enhanced feature highlights */}
      <div className="space-y-3 lg:space-y-4">
        <div className="group flex items-center gap-4 p-4 lg:p-5 auth-glass rounded-xl transition-all duration-500 hover:bg-white/10 hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/10 border border-white/10 hover:border-blue-400/30">
          <div className="relative flex h-12 w-12 lg:h-14 lg:w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/30 to-indigo-600/30 border border-blue-400/30 group-hover:from-blue-400/40 group-hover:to-indigo-500/40 transition-all duration-300">
            <BarChart3 className="h-6 w-6 lg:h-7 lg:w-7 text-blue-200 group-hover:text-blue-100 transition-colors duration-300" />
            <div className="absolute inset-0 bg-blue-400/20 rounded-xl blur-md group-hover:bg-blue-300/30 transition-all duration-300" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-white text-base lg:text-lg group-hover:text-blue-100 transition-colors duration-300">Real-time Analytics</p>
            <p className="text-sm lg:text-base text-blue-200 group-hover:text-blue-100 transition-colors duration-300">Track votes and engagement instantly</p>
          </div>
          <Zap className="h-4 w-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-all duration-300" />
        </div>
        
        <div className="group flex items-center gap-4 p-4 lg:p-5 auth-glass rounded-xl transition-all duration-500 hover:bg-white/10 hover:scale-[1.02] hover:shadow-lg hover:shadow-emerald-500/10 border border-white/10 hover:border-emerald-400/30">
          <div className="relative flex h-12 w-12 lg:h-14 lg:w-14 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/30 to-green-600/30 border border-emerald-400/30 group-hover:from-emerald-400/40 group-hover:to-green-500/40 transition-all duration-300">
            <TrendingUp className="h-6 w-6 lg:h-7 lg:w-7 text-emerald-200 group-hover:text-emerald-100 transition-colors duration-300" />
            <div className="absolute inset-0 bg-emerald-400/20 rounded-xl blur-md group-hover:bg-emerald-300/30 transition-all duration-300" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-white text-base lg:text-lg group-hover:text-emerald-100 transition-colors duration-300">Growing Community</p>
            <p className="text-sm lg:text-base text-blue-200 group-hover:text-emerald-100 transition-colors duration-300">Join thousands of active users</p>
          </div>
          <Sparkles className="h-4 w-4 text-emerald-400 opacity-0 group-hover:opacity-100 transition-all duration-300" />
        </div>
        
        <div className="group flex items-center gap-4 p-4 lg:p-5 auth-glass rounded-xl transition-all duration-500 hover:bg-white/10 hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/10 border border-white/10 hover:border-purple-400/30">
          <div className="relative flex h-12 w-12 lg:h-14 lg:w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-600/30 border border-purple-400/30 group-hover:from-purple-400/40 group-hover:to-pink-500/40 transition-all duration-300">
            <Users className="h-6 w-6 lg:h-7 lg:w-7 text-purple-200 group-hover:text-purple-100 transition-colors duration-300" />
            <div className="absolute inset-0 bg-purple-400/20 rounded-xl blur-md group-hover:bg-purple-300/30 transition-all duration-300" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-white text-base lg:text-lg group-hover:text-purple-100 transition-colors duration-300">Smart Insights</p>
            <p className="text-sm lg:text-base text-blue-200 group-hover:text-purple-100 transition-colors duration-300">Make data-driven decisions</p>
          </div>
          <TrendingUp className="h-4 w-4 text-purple-400 opacity-0 group-hover:opacity-100 transition-all duration-300" />
        </div>
      </div>

      {/* Bottom quote */}
      <div className="mt-auto">
        <div className="p-6 bg-gradient-to-r from-white/5 to-blue-500/5 auth-backdrop rounded-lg border border-white/20 animate-gradient-shift">
          <blockquote className="space-y-3">
            <p className="text-lg font-medium text-white italic">
              "The platform that transforms opinions into actionable insights."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400"></div>
              <p className="text-sm text-blue-200">Trusted by data-driven teams worldwide</p>
            </div>
          </blockquote>
        </div>
      </div>
    </div>
  )
}