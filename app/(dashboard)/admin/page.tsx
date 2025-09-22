import { Metadata } from "next";
import { createServerComponentClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { RoleProvider } from "@/contexts/role-context";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { UserRole } from "@/lib/types/roles";

export const metadata: Metadata = {
  title: "Admin Dashboard | Polling App",
  description: "Manage users and system settings",
};

async function getUserProfile(userId: string) {
  const supabase = await createServerComponentClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", userId)
    .single();

  console.log("getUserProfile Debug:", { userId, profile, error });

  return { profile, error };
}

export default async function AdminPage() {
  const supabase = await createServerComponentClient();

  // Check if user is authenticated
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  console.log("Admin Page Auth Debug:", { user: user?.id, authError });

  if (authError || !user) {
    console.log("Redirecting to login - no user");
    redirect("/login");
  }

  // Get user profile and check if user has admin access
  const { profile, error: profileError } = await getUserProfile(user.id);

  console.log("Admin Page Profile Debug:", { profile, profileError });

  if (profileError || !profile) {
    console.log("Profile error or no profile, redirecting to dashboard");
    redirect("/dashboard");
  }

  if (profile.role !== "admin" && profile.role !== "moderator") {
    console.log(
      `Role ${profile.role} not authorized, redirecting to dashboard`,
    );
    redirect("/dashboard");
  }

  console.log(`Admin access granted for role: ${profile.role}`);

  return (
    <DashboardShell>
      <RoleProvider userId={user.id} initialRole={profile.role as UserRole}>
        <AdminDashboard />
      </RoleProvider>
    </DashboardShell>
  );
}
