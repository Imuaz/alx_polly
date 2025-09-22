import { Metadata } from "next";
import { createServerComponentClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Admin Test | Polling App",
  description: "Test admin access and role detection",
};

async function getUserProfile(userId: string) {
  const supabase = await createServerComponentClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", userId)
    .single();

  return { profile, error };
}

export default async function AdminTestPage() {
  const supabase = await createServerComponentClient();

  // Check if user is authenticated
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Get user profile and check if user has admin access
  const { profile, error: profileError } = await getUserProfile(user.id);

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Admin Access Test</h1>

      <div className="space-y-4">
        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">User Authentication</h2>
          <p>
            <strong>User ID:</strong> {user?.id}
          </p>
          <p>
            <strong>Email:</strong> {user?.email}
          </p>
          <p>
            <strong>Auth Error:</strong>{" "}
            {authError ? String(authError) : "None"}
          </p>
        </div>

        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Profile Data</h2>
          {profileError ? (
            <div>
              <p className="text-red-600">
                <strong>Profile Error:</strong> {profileError.message}
              </p>
              <p>
                <strong>Error Code:</strong> {profileError.code}
              </p>
              <p>
                <strong>Error Details:</strong> {profileError.details}
              </p>
            </div>
          ) : profile ? (
            <div>
              <p>
                <strong>Profile ID:</strong> {profile.id}
              </p>
              <p>
                <strong>Full Name:</strong> {profile.full_name}
              </p>
              <p>
                <strong>Role:</strong>{" "}
                <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                  {profile.role}
                </span>
              </p>
              <p>
                <strong>Is Admin/Moderator:</strong>{" "}
                {profile.role === "admin" || profile.role === "moderator"
                  ? "✅ YES"
                  : "❌ NO"}
              </p>
            </div>
          ) : (
            <p>Profile data is null</p>
          )}
        </div>

        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Admin Access Check</h2>
          {profile &&
          (profile.role === "admin" || profile.role === "moderator") ? (
            <div className="text-green-600">
              <p className="text-2xl">✅ ADMIN ACCESS GRANTED</p>
              <p>You should be able to access the admin panel.</p>
              <a
                href="/admin"
                className="inline-block mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Go to Admin Panel
              </a>
            </div>
          ) : (
            <div className="text-red-600">
              <p className="text-2xl">❌ ADMIN ACCESS DENIED</p>
              <p>
                Your role ({profile?.role || "unknown"}) does not have admin
                privileges.
              </p>
            </div>
          )}
        </div>

        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Database Query Test</h2>
          <p>If you see a role above, the database query is working.</p>
          <p>If there's an error, check that:</p>
          <ul className="list-disc ml-6 mt-2">
            <li>The profiles table exists</li>
            <li>The role column exists</li>
            <li>The role migration has been applied</li>
            <li>RLS policies allow reading profiles</li>
          </ul>
        </div>

        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Quick Fix</h2>
          <p>To make this user an admin, run this SQL in Supabase:</p>
          <code className="block mt-2 p-2 bg-gray-100 rounded font-mono text-sm">
            UPDATE public.profiles SET role = 'admin' WHERE id = '{user.id}';
          </code>
        </div>
      </div>
    </div>
  );
}
