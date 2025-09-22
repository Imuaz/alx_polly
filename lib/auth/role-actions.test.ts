import {
  getUsersWithRoles,
  updateUserRole,
  updateRolePermissions,
} from "./role-actions";
import { UserRole, RolePermissions } from "@/lib/types/roles";
import { createClient } from "@/lib/supabase";

jest.mock("@/lib/supabase", () => ({
  createClient: jest.fn(),
}));

describe("Role Actions", () => {
  const mockSupabase = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    order: jest.fn().mockReturnThis(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockReturnValue(mockSupabase);

    // Reset the chain to return proper values
    mockSupabase.from.mockReturnValue(mockSupabase);
    mockSupabase.select.mockReturnValue(mockSupabase);
    mockSupabase.update.mockReturnValue(mockSupabase);
    mockSupabase.upsert.mockReturnValue(mockSupabase);
    mockSupabase.eq.mockReturnValue(mockSupabase);
    mockSupabase.order.mockReturnValue(mockSupabase);
  });

  describe("getUsersWithRoles", () => {
    it("should fetch users with roles", async () => {
      const mockData = [
        {
          id: "1",
          full_name: "Test User",
          role: UserRole.USER,
          email: "test@example.com",
        },
      ];

      mockSupabase.order.mockResolvedValueOnce({ data: mockData, error: null });

      const result = await getUsersWithRoles();

      expect(result).toEqual([
        {
          id: "1",
          name: "Test User",
          email: "test@example.com",
          role: UserRole.USER,
        },
      ]);
    });

    it("should handle empty data response", async () => {
      mockSupabase.order.mockResolvedValueOnce({ data: [], error: null });

      const result = await getUsersWithRoles();
      expect(result).toEqual([]);
    });

    it("should handle null data response", async () => {
      mockSupabase.order.mockResolvedValueOnce({ data: null, error: null });

      const result = await getUsersWithRoles();
      expect(result).toEqual([]);
    });

    it("should handle errors", async () => {
      mockSupabase.order.mockResolvedValueOnce({
        data: null,
        error: new Error("Failed to fetch"),
      });

      await expect(getUsersWithRoles()).rejects.toThrow(
        "Failed to fetch users",
      );
    });

    it("should order users by full name", async () => {
      const mockData = [
        {
          id: "1",
          full_name: "Alice User",
          role: UserRole.USER,
          email: "alice@example.com",
        },
        {
          id: "2",
          full_name: "Bob Admin",
          role: UserRole.ADMIN,
          email: "bob@example.com",
        },
      ];

      mockSupabase.order.mockResolvedValueOnce({ data: mockData, error: null });

      const result = await getUsersWithRoles();
      expect(mockSupabase.order).toHaveBeenCalledWith("full_name");
      expect(result[0].name).toBe("Alice User");
      expect(result[1].name).toBe("Bob Admin");
    });
  });

  describe("updateUserRole", () => {
    it("should update user role", async () => {
      mockSupabase.single.mockResolvedValueOnce({ error: null });

      await expect(updateUserRole("1", UserRole.ADMIN)).resolves.not.toThrow();

      expect(mockSupabase.update).toHaveBeenCalledWith({
        role: UserRole.ADMIN,
        updated_at: expect.any(String),
      });
    });

    it("should handle errors", async () => {
      mockSupabase.single.mockResolvedValueOnce({
        error: new Error("Update failed"),
      });

      await expect(updateUserRole("1", UserRole.ADMIN)).rejects.toThrow(
        "Failed to update user role",
      );
    });

    it("should validate roles", async () => {
      await expect(
        updateUserRole("1", "invalid-role" as UserRole),
      ).rejects.toThrow("Invalid role provided");
    });

    it("should validate user ID", async () => {
      await expect(updateUserRole("", UserRole.ADMIN)).rejects.toThrow(
        "Invalid user ID",
      );
      await expect(updateUserRole(null as any, UserRole.ADMIN)).rejects.toThrow(
        "Invalid user ID",
      );
    });

    it("should include timestamp in update", async () => {
      mockSupabase.single.mockResolvedValueOnce({ error: null });
      const before = new Date().getTime();

      await updateUserRole("1", UserRole.MODERATOR);

      const updateCall = mockSupabase.update.mock.calls[0][0];
      const timestamp = new Date(updateCall.updated_at).getTime();

      expect(timestamp).toBeGreaterThanOrEqual(before);
      expect(timestamp).toBeLessThanOrEqual(new Date().getTime());
    });

    it("should handle different role transitions", async () => {
      mockSupabase.single.mockResolvedValueOnce({ error: null });
      await updateUserRole("1", UserRole.USER);
      expect(mockSupabase.update).toHaveBeenCalledWith(
        expect.objectContaining({ role: UserRole.USER }),
      );

      mockSupabase.single.mockResolvedValueOnce({ error: null });
      await updateUserRole("1", UserRole.MODERATOR);
      expect(mockSupabase.update).toHaveBeenCalledWith(
        expect.objectContaining({ role: UserRole.MODERATOR }),
      );

      mockSupabase.single.mockResolvedValueOnce({ error: null });
      await updateUserRole("1", UserRole.ADMIN);
      expect(mockSupabase.update).toHaveBeenCalledWith(
        expect.objectContaining({ role: UserRole.ADMIN }),
      );
    });
  });

  describe("updateRolePermissions", () => {
    const mockPermissions: RolePermissions = {
      canCreatePolls: true,
      canDeletePolls: true,
      canManageUsers: false,
      canModerateComments: true,
      canAccessAdminPanel: false,
    };

    it("should update role permissions", async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { role: UserRole.MODERATOR, permissions: mockPermissions },
        error: null,
      });

      const result = await updateRolePermissions(
        UserRole.MODERATOR,
        mockPermissions,
      );

      expect(result).toEqual({
        role: UserRole.MODERATOR,
        permissions: mockPermissions,
      });
    });

    it("should handle errors", async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: new Error("Update failed"),
      });

      await expect(
        updateRolePermissions(UserRole.MODERATOR, mockPermissions),
      ).rejects.toThrow("Failed to update role permissions");
    });

    it("should validate required permissions", async () => {
      const invalidPermissions = {
        canCreatePolls: true,
      } as any;

      await expect(
        updateRolePermissions(UserRole.MODERATOR, invalidPermissions),
      ).rejects.toThrow("Missing or invalid permission");
    });
  });
});
