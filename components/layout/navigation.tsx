"use client";

// @deprecated This component has been replaced by the new Navbar and MobileNav components
// Please use components/layout/navbar.tsx and components/layout/mobile-nav.tsx instead
// This file will be removed in a future update

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context-minimal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BarChart3 as Poll,
  LogOut,
  Shield,
  Plus,
  Home,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";

interface NavigationItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresRole?: string[];
}

const navigationItems: NavigationItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/polls",
    label: "Polls",
    icon: Poll,
  },
  {
    href: "/polls/create",
    label: "Create Poll",
    icon: Plus,
  },
  {
    href: "/admin",
    label: "Admin",
    icon: Shield,
    requiresRole: ["admin", "moderator"],
  },
];

/**
 * @deprecated Use Navbar and MobileNav components instead
 */
export function Navigation() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Fetch user role from profiles table
  useEffect(() => {
    async function fetchUserRole() {
      if (!user) return;

      const supabase = createClient();
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!error && profile) {
        setUserRole(profile.role);
      }
    }

    fetchUserRole();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-background shadow-md"
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-background/80"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Desktop Sidebar & Mobile Slide-out */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col border-r bg-card shadow-lg transition-transform duration-300 ease-in-out lg:translate-x-0 lg:relative lg:z-auto",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Header */}
        <div className="p-6 border-b">
          <Link
            href="/dashboard"
            className="flex items-center gap-3"
            onClick={() => setIsOpen(false)}
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Poll className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Polling App</h2>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 px-4 py-4">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);

            // Check role-based access
            if (
              item.requiresRole &&
              (!userRole || !item.requiresRole.includes(userRole))
            ) {
              return null;
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="border-t p-4">
          {user && (
            <div className="mb-2 text-xs text-muted-foreground">
              {user.email}
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="w-full justify-start gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </>
  );
}
