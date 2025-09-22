"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context-minimal";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BarChart3 as Poll,
  LogOut,
  Shield,
  Plus,
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

export function MobileNav() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

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
    setIsOpen(false);
    await signOut();
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  const getUserDisplayName = () => {
    return user?.user_metadata?.full_name || user?.email || "User";
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-9 w-9"
        >
          <Menu className="h-4 w-4" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center gap-3 border-b px-6 py-4">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Poll className="h-4 w-4 text-white" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold">Polling App</h2>
            </div>
          </div>

          {/* User Profile Section */}
          {user && (
            <div className="border-b px-6 py-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={user?.user_metadata?.avatar_url}
                    alt={getUserDisplayName()}
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(
                      user?.user_metadata?.full_name,
                      user?.email
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">
                    {getUserDisplayName()}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
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
                    "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground"
                  )}
                  prefetch={true}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t p-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="w-full justify-start gap-2 text-red-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
