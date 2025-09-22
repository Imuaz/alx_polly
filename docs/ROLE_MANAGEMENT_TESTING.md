# Role Management System Testing Guide

## Overview

This guide provides comprehensive instructions for testing the role management system that has been implemented in the Polling App. The system includes three user roles: `user`, `moderator`, and `admin`, each with specific permissions.

## System Architecture

### User Roles

1. **User** (default role)
   - Can create polls
   - Can vote on polls
   - Cannot delete other users' polls
   - Cannot access admin panel

2. **Moderator**
   - All user permissions
   - Can delete any poll (moderation)
   - Can moderate comments (when implemented)
   - Can access admin panel (limited features)

3. **Admin**
   - All moderator permissions
   - Can manage user roles
   - Can access full admin panel
   - Can manage system settings

### Permission Matrix

| Permission | User | Moderator | Admin |
|------------|------|-----------|-------|
| Create Polls | ✅ | ✅ | ✅ |
| Delete Own Polls | ✅ | ✅ | ✅ |
| Delete Any Poll | ❌ | ✅ | ✅ |
| Manage Users | ❌ | ❌ | ✅ |
| Moderate Comments | ❌ | ✅ | ✅ |
| Access Admin Panel | ❌ | ✅ (limited) | ✅ (full) |

## Database Setup

### 1. Apply Role Migration

First, ensure the role migration has been applied to your database:

```sql
-- Run this in Supabase SQL Editor if not already applied
-- Content from: /migrations/0002_add_user_roles.sql
```

### 2. Create Test Users

#### Method 1: Through Supabase Dashboard

1. Go to Supabase Dashboard → Authentication → Users
2. Create new users manually with different email addresses
3. Note down the User IDs for each created user

#### Method 2: Through App Registration

1. Navigate to `/register` in your app
2. Create multiple test accounts:
   - `admin@test.com` (will be made admin)
   - `moderator@test.com` (will be made moderator)
   - `user@test.com` (remains user)

### 3. Assign Roles

Run this SQL in your Supabase SQL Editor:

```sql
-- Replace the email addresses with your actual test user emails
-- Make first user admin
UPDATE public.profiles 
SET role = 'admin' 
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'admin@test.com'
);

-- Make second user moderator
UPDATE public.profiles 
SET role = 'moderator' 
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'moderator@test.com'
);

-- Third user remains 'user' (default)

-- Verify roles
SELECT p.id, u.email, p.full_name, p.role
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
ORDER BY p.role;
```

## Testing Scenarios

### Test 1: Authentication & Role Loading

**Objective**: Verify that user roles are properly loaded on login.

**Steps**:
1. Open browser developer tools (F12)
2. Navigate to `/login`
3. Login with admin test user
4. Check that you're redirected to `/polls` or `/dashboard`
5. Inspect the network tab for profile data requests
6. Verify role is correctly loaded in the response

**Expected Results**:
- User is successfully authenticated
- Profile data includes correct role
- No console errors

### Test 2: Admin Panel Access Control

**Objective**: Test role-based access to admin panel.

**Test Cases**:

#### A. Admin User Access
1. Login as admin user
2. Navigate to `/admin`
3. Verify full access to admin dashboard

**Expected**: Full access granted, both User Management and Role Management tabs visible

#### B. Moderator User Access
1. Login as moderator user
2. Navigate to `/admin`
3. Verify limited access to admin dashboard

**Expected**: Access granted, limited admin features visible

#### C. Regular User Access
1. Login as regular user
2. Navigate to `/admin`
3. Should be redirected to `/dashboard`

**Expected**: Access denied, redirected to dashboard with appropriate message

### Test 3: Navigation Visibility

**Objective**: Verify that navigation shows appropriate links based on user role.

**Test Cases**:

#### A. Admin Navigation
1. Login as admin
2. Check sidebar navigation
3. Verify "Admin" link is visible

#### B. User Navigation
1. Login as regular user
2. Check sidebar navigation
3. Verify "Admin" link is NOT visible

### Test 4: User Role Management (Admin Only)

**Objective**: Test admin's ability to manage user roles.

**Prerequisites**: Must be logged in as admin user.

**Steps**:
1. Navigate to `/admin`
2. Click on "User Management" tab
3. Verify list of users is displayed with current roles
4. Try changing a user's role from the dropdown
5. Refresh the page and verify the change persisted

**Expected Results**:
- All users are listed with their current roles
- Role changes are saved successfully
- Changes persist after page refresh
- Only admins can access this functionality

### Test 5: Permission Context Testing

**Objective**: Verify that the role context provides correct permissions.

**Testing Method**: Use browser console to test permissions.

```javascript
// Open browser console and run these commands
// (This assumes you have access to the React DevTools or the context is exposed)

// Check current user role
console.log('Current role:', /* access role from context */);

// Test permission checking
const permissions = [
  'canCreatePolls',
  'canDeletePolls', 
  'canManageUsers',
  'canModerateComments',
  'canAccessAdminPanel'
];

permissions.forEach(permission => {
  console.log(`${permission}:`, /* check permission from context */);
});
```

### Test 6: Poll Management Permissions

**Objective**: Test role-based poll management capabilities.

**Test Cases**:

#### A. Poll Creation (All Roles)
1. Login with each role type
2. Navigate to polls page
3. Create a new poll
4. Verify all roles can create polls

#### B. Poll Deletion
1. Create polls with different users
2. Login as regular user - try to delete another user's poll
3. Login as moderator - try to delete any poll
4. Login as admin - try to delete any poll

**Expected**:
- Users can only delete their own polls
- Moderators and admins can delete any poll

### Test 7: Error Handling

**Objective**: Test system behavior with invalid role operations.

**Test Cases**:

#### A. Invalid Role Assignment
1. Login as admin
2. Use browser dev tools to modify role assignment request
3. Try to assign invalid role (e.g., 'superuser')
4. Verify error handling

#### B. Unauthorized Access
1. Manually navigate to `/admin` without logging in
2. Verify redirect to login page
3. Login as regular user, then manually navigate to `/admin`
4. Verify access denied

## Browser/Client Testing Instructions

### Setup for Client Testing

1. **Start the Development Server**:
   ```bash
   cd alx-polly
   npm run dev
   ```

2. **Open Multiple Browser Profiles**:
   - Chrome: Use different profiles or incognito windows
   - This allows testing with multiple users simultaneously

3. **Prepare Test Data**:
   - Ensure you have users with different roles created
   - Have some test polls created for permission testing

### Testing Workflow

#### Step 1: Basic Authentication Test
1. Navigate to `http://localhost:3000`
2. You should be redirected to `/login`
3. Test login with your admin test user
4. Verify redirect to dashboard/polls page

#### Step 2: Admin Panel Access
1. While logged in as admin, navigate to `http://localhost:3000/admin`
2. Verify you can access the admin dashboard
3. Check both "User Management" and "Role Management" tabs
4. Verify user list loads correctly

#### Step 3: Role Management
1. In the admin panel, go to "User Management" tab
2. Find a test user and change their role
3. Observe the loading state during the update
4. Refresh the page to verify the change persisted

#### Step 4: Permission Testing
1. Open a new incognito window
2. Login with a regular user account
3. Try to access `http://localhost:3000/admin`
4. Verify you're redirected away with appropriate messaging

#### Step 5: Navigation Testing
1. Compare the navigation sidebar between different user roles
2. Admin/Moderator users should see "Admin" link
3. Regular users should not see admin-related navigation

### Common Issues and Troubleshooting

#### Issue 1: Role Not Loading
**Symptoms**: User role appears as undefined or null
**Solutions**:
- Check that the role migration was applied
- Verify user has a profile record in the database
- Check browser console for API errors

#### Issue 2: Admin Panel Shows "No Permission"
**Symptoms**: Admin user sees permission denied message
**Solutions**:
- Verify user actually has admin/moderator role in database
- Check that RoleProvider is correctly wrapping the component
- Verify the initial role is being passed correctly

#### Issue 3: Role Changes Not Persisting
**Symptoms**: Role changes in admin panel don't save
**Solutions**:
- Check network tab for failed API requests
- Verify RLS policies allow role updates
- Check Supabase logs for permission errors

#### Issue 4: Navigation Not Updating
**Symptoms**: Admin links not showing/hiding based on role
**Solutions**:
- Verify the role context is properly connected
- Check that navigation component is using the role context
- Clear browser cache and refresh

## API Testing

### Test User Role Updates

```bash
# Test role update API (using curl or similar tool)
# Replace with actual user ID and ensure you're authenticated

curl -X POST 'http://localhost:3000/api/admin/update-role' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_SESSION_TOKEN' \
  -d '{
    "userId": "user-uuid-here",
    "newRole": "moderator"
  }'
```

### Test User Listing

```bash
# Test user listing API
curl -X GET 'http://localhost:3000/api/admin/users' \
  -H 'Authorization: Bearer YOUR_SESSION_TOKEN'
```

## Automated Testing

### Running Unit Tests

```bash
# Run role-related tests
npm test -- --testPathPatterns="role"

# Run all tests
npm test
```

### Test Coverage

Ensure the following components are tested:
- ✅ Role actions (`lib/auth/role-actions.ts`)
- ✅ Role context (`contexts/role-context.tsx`)
- ✅ Admin components (`components/admin/`)
- ✅ Role permissions logic

## Security Considerations

### Important Security Checks

1. **Server-Side Validation**: Verify that role checks happen on the server, not just the client
2. **RLS Policies**: Ensure Row Level Security policies are properly configured
3. **API Endpoints**: Check that admin API endpoints validate user permissions
4. **Token Security**: Verify that authentication tokens are properly validated

### Security Testing

1. **Test with Modified Requests**: Use browser dev tools to modify role-related requests
2. **Test Direct API Access**: Try to access admin APIs without proper authentication
3. **Test Role Escalation**: Verify users can't elevate their own permissions

## Performance Testing

### Load Testing Scenarios

1. **User List Loading**: Test admin panel with many users
2. **Role Updates**: Test bulk role updates
3. **Permission Checking**: Verify permission checks don't cause performance issues

### Monitoring

- Watch for slow database queries related to role checking
- Monitor API response times for admin operations
- Check for memory leaks in role context provider

## Conclusion

The role management system provides a solid foundation for user permission control. Regular testing of these scenarios ensures the system maintains security and functionality as the application grows.

For any issues or questions, refer to the implementation files:
- `/lib/types/roles.ts` - Role definitions
- `/lib/auth/role-actions.ts` - Role management logic
- `/contexts/role-context.tsx` - Role context provider
- `/components/admin/` - Admin interface components
- `/app/(dashboard)/admin/page.tsx` - Admin page implementation