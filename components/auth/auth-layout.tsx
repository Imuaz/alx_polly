import React from 'react'
import Link from 'next/link'
import { BarChart3 } from 'lucide-react'

interface AuthLayoutProps {
  children: React.ReactNode
  backgroundType: 'login' | 'register'
  sidePanel: React.ReactNode
}

export function AuthLayout({ children, backgroundType, sidePanel }: AuthLayoutProps) {
  // Using consistent blue/indigo background for both login and register pages
  const gradients = {
    login: 'from-slate-900 via-blue-900 to-indigo-900',
    register: 'from-slate-900 via-blue-900 to-indigo-900',
  }

  const logoGradients = {
    login: 'from-blue-500 to-indigo-600',
    register: 'from-blue-500 to-indigo-600',
  }

  const patterns = {
    login: "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M30 30c0-16.569 13.431-30 30-30v60c-16.569 0-30-13.431-30-30z'%3E%3C/path%3E%3C/g%3E%3C/g%3E%3C/svg%3E",
    register: "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M30 30c0-16.569 13.431-30 30-30v60c-16.569 0-30-13.431-30-30z'%3E%3C/path%3E%3C/g%3E%3C/g%3E%3C/svg%3E",
  }

  return (
    <div className="relative min-h-screen">
      {/* Two-column layout for large screens, single column for medium/small */}
      <div className="hidden lg:grid lg:grid-cols-2 lg:max-w-none min-h-screen">
        {/* Left Panel - Only visible on large screens */}
        <div className="relative min-h-screen flex-col justify-center p-4 md:p-6 lg:p-8 xl:p-12 text-white flex dark:border-r overflow-hidden" role="banner" aria-label="Welcome content">
        {/* Enhanced multi-layered gradient background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradients[backgroundType]}`} />
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-500/5 to-indigo-500/10" />
        <div className="absolute inset-0 bg-gradient-radial from-blue-500/5 via-transparent to-transparent" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url('${patterns[backgroundType]}')`,
          }}
        />
        
        {/* Enhanced animated background elements */}
        <div className="absolute top-20 right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-float-gentle" />
        <div className="absolute top-40 right-32 w-20 h-20 bg-cyan-400/8 rounded-full blur-lg animate-float-slow" />
        <div className="absolute bottom-32 left-8 w-24 h-24 bg-indigo-500/10 rounded-full blur-lg animate-pulse-glow" />
        <div className="absolute bottom-20 right-20 w-16 h-16 bg-purple-500/8 rounded-full blur-md animate-float-gentle" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-4 w-12 h-12 bg-blue-400/6 rounded-full blur-sm animate-pulse-glow" style={{ animationDelay: '1s' }} />
        
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
        
        {/* Header */}
        <div className="relative z-20 flex items-center text-lg font-medium mb-auto">
          <div className="flex items-center gap-3">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r ${logoGradients[backgroundType]}`} aria-hidden="true">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
            <Link href="/" className="font-semibold hover:text-white/80 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-transparent rounded-sm" aria-label="Go to homepage">Polling App</Link>
          </div>
        </div>
        
        {/* Main content - properly centered */}
        <div className="relative z-20 flex-1 flex flex-col justify-center" role="complementary" aria-label="Welcome information">
          {sidePanel}
        </div>
      </div>
      
        {/* Right Panel for Large Screens - Form with Enhanced Background */}
        <div className="relative flex items-center justify-center p-2 sm:p-3 md:p-4 lg:p-6 min-h-screen overflow-hidden">
          {/* Beautiful layered background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700" />
          <div className="absolute inset-0 bg-gradient-to-tr from-white/40 via-blue-50/20 to-purple-50/30 dark:from-slate-800/40 dark:via-slate-700/20 dark:to-slate-600/30" />
          
          {/* Animated gradient orbs */}
          <div className="absolute top-10 right-10 w-72 h-72 bg-gradient-to-r from-blue-400/10 to-purple-400/10 dark:from-blue-500/5 dark:to-purple-500/5 rounded-full blur-3xl animate-float-gentle" />
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-gradient-to-r from-indigo-400/8 to-pink-400/8 dark:from-indigo-500/4 dark:to-pink-500/4 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-gradient-to-r from-cyan-400/6 to-blue-400/6 dark:from-cyan-500/3 dark:to-blue-500/3 rounded-full blur-2xl animate-float-gentle" style={{ animationDelay: '1s' }} />
          
          {/* Elegant geometric patterns */}
          <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]" style={{
            backgroundImage: `
              radial-gradient(circle at 25% 25%, rgb(59 130 246) 1px, transparent 1px),
              radial-gradient(circle at 75% 75%, rgb(147 51 234) 1px, transparent 1px),
              linear-gradient(45deg, transparent 49%, rgb(59 130 246) 49%, rgb(59 130 246) 51%, transparent 51%)
            `,
            backgroundSize: '60px 60px, 80px 80px, 40px 40px'
          }} />
          
          {/* Mesh gradient overlay */}
          <div 
            className="absolute inset-0 opacity-30 dark:opacity-20"
            style={{
              backgroundImage: `
                conic-gradient(from 0deg at 50% 0%, transparent 0deg, rgb(59 130 246) 60deg, transparent 120deg),
                conic-gradient(from 120deg at 100% 50%, transparent 0deg, rgb(147 51 234) 60deg, transparent 120deg),
                conic-gradient(from 240deg at 50% 100%, transparent 0deg, rgb(236 72 153) 60deg, transparent 120deg)
              `,
              filter: 'blur(40px)'
            }}
          />
          
          {/* Subtle dot pattern overlay */}
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.08]" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(100 116 139) 1px, transparent 0)',
            backgroundSize: '24px 24px'
          }} />
          
          {/* Form container for large screens */}
          <div className="relative z-10 w-full max-w-[420px] space-y-2 sm:space-y-3 auth-compact">
            {/* Enhanced glassmorphism backdrop */}
            <div className="absolute inset-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl backdrop-saturate-150 rounded-2xl sm:rounded-3xl shadow-2xl shadow-slate-500/20 dark:shadow-slate-900/40 border border-white/30 dark:border-slate-700/60 -z-10" />
            {/* Additional contrast layer */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-blue-50/30 to-white/20 dark:from-slate-700/20 dark:via-slate-600/30 dark:to-slate-700/20 rounded-2xl sm:rounded-3xl -z-10" />
            <div className="p-4 sm:p-6 lg:p-7">
              {children}
            </div>
          </div>
        </div>
      </div>
      
      {/* Single-column layout for medium and small screens */}
      <div className="lg:hidden min-h-screen flex items-center justify-center p-4">
        {/* Centered form container with minimal background */}
        <div className="w-full max-w-[400px] space-y-3">
          <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-4 sm:p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}