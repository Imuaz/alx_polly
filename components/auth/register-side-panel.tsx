import React from 'react'
import { BarChart3, TrendingUp, Users } from 'lucide-react'

export function RegisterSidePanel() {
  return (
    <div className="space-y-8 auth-side-panel">
      <div className="space-y-4">
        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent animate-text-glow auth-text-responsive">
          Join our thriving
          <span className="block text-blue-300 animate-counter-up">community of creators</span>
        </h2>
        <p className="text-base md:text-lg text-blue-100 leading-relaxed auth-subtitle-responsive">
          Connect with thousands of users who create meaningful polls and share valuable insights every day.
        </p>
      </div>
      
      {/* Feature highlights - matching Login page structure */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 auth-glass rounded-lg transition-all duration-300 hover:bg-white/10">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-400/20">
            <Users className="h-5 w-5 text-blue-300" />
          </div>
          <div>
            <p className="font-medium text-white">Growing Community</p>
            <p className="text-sm text-blue-200">Join 15K+ active creators</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-4 auth-glass rounded-lg transition-all duration-300 hover:bg-white/10">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/20">
            <BarChart3 className="h-5 w-5 text-green-300" />
          </div>
          <div>
            <p className="font-medium text-white">Easy Poll Creation</p>
            <p className="text-sm text-blue-200">Create and share polls instantly</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-4 auth-glass rounded-lg transition-all duration-300 hover:bg-white/10">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/20">
            <TrendingUp className="h-5 w-5 text-purple-300" />
          </div>
          <div>
            <p className="font-medium text-white">Real-time Results</p>
            <p className="text-sm text-blue-200">See engagement and insights live</p>
          </div>
        </div>
      </div>

      {/* Bottom quote - matching Login page structure */}
      <div className="mt-auto">
        <div className="p-6 bg-gradient-to-r from-white/5 to-blue-500/5 auth-backdrop rounded-lg border border-white/20 animate-gradient-shift">
          <blockquote className="space-y-3">
            <p className="text-lg font-medium text-white italic">
              "Start creating meaningful polls and connect with your audience today."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400"></div>
              <p className="text-sm text-blue-200">Join thousands of creators worldwide</p>
            </div>
          </blockquote>
        </div>
      </div>
    </div>
  )
}