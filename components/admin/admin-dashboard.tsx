"use client";

import React from "react";
import { useRole } from "@/contexts/role-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserManagement } from "./user-management";
import { RoleManagement } from "./role-management";

export function AdminDashboard() {
  const { hasPermission, userRole, permissions, isAdmin, isModerator } =
    useRole();

  // Debug information
  console.log("AdminDashboard Debug:", {
    userRole,
    permissions,
    isAdmin,
    isModerator,
    hasAdminPanelAccess: hasPermission("canAccessAdminPanel"),
  });

  if (!hasPermission("canAccessAdminPanel")) {
    return (
      <div className="p-4">
        <p className="text-red-500">
          You don't have permission to access this page.
        </p>
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="font-semibold">Debug Info:</h3>
          <p>Role: {userRole}</p>
          <p>Is Admin: {isAdmin ? "Yes" : "No"}</p>
          <p>Is Moderator: {isModerator ? "Yes" : "No"}</p>
          <p>
            Can Access Admin Panel:{" "}
            {hasPermission("canAccessAdminPanel") ? "Yes" : "No"}
          </p>
          <p>Permissions: {JSON.stringify(permissions, null, 2)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="mb-4 p-2 bg-green-100 rounded text-sm">
        <strong>Debug:</strong> User Role: {userRole}, Admin Access: ✅
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="roles">Role Management</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <UserManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles">
          <Card>
            <CardHeader>
              <CardTitle>Role Management</CardTitle>
            </CardHeader>
            <CardContent>
              <RoleManagement />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
