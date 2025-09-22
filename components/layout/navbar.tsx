"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context-minimal";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BarChart3 as Poll,
  LogOut,
  Shield,
  Plus,
  Settings,
  User,
  ChevronDown,
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

export function Navbar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

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
    setIsUserMenuOpen(false);
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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        {/* Logo */}
        <div className="mr-4 hidden md:flex">
          <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Poll className="h-4 w-4 text-white" />
            </div>
            <span className="hidden font-bold sm:inline-block">
              Polling App
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
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
                className={cn(
                  "flex items-center space-x-2 transition-colors hover:text-foreground/80",
                  isActive ? "text-foreground" : "text-foreground/60"
                )}
                prefetch={true}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          {/* Mobile Logo */}
          <div className="flex md:hidden">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Poll className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold">Polling App</span>
            </Link>
          </div>

          {/* Right side: Theme Toggle + User Menu */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Menu */}
            {user && (
              <DropdownMenu open={isUserMenuOpen} onOpenChange={setIsUserMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-auto rounded-full px-3 transition-all duration-200 hover:bg-accent"
                  >
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={user?.user_metadata?.avatar_url}
                          alt={getUserDisplayName()}
                        />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {getInitials(
                            user?.user_metadata?.full_name,
                            user?.email
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform duration-200",
                          isUserMenuOpen && "rotate-180"
                        )}
                      />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56"
                  align="end"
                  sideOffset={4}
                  forceMount
                >
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {getUserDisplayName()}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      href="/dashboard"
                      className="cursor-pointer"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/polls"
                      className="cursor-pointer"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Poll className="mr-2 h-4 w-4" />
                      <span>My Polls</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/polls/create"
                      className="cursor-pointer"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      <span>Create Poll</span>
                    </Link>
                  </DropdownMenuItem>
                  {userRole && ["admin", "moderator"].includes(userRole) && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link
                          href="/admin"
                          className="cursor-pointer"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Shield className="mr-2 h-4 w-4" />
                          <span>Admin Panel</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600 focus:text-red-600 dark:text-red-400"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
