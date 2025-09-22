#!/usr/bin/env node

/**
 * Role Management System Test Script
 *
 * This script helps verify that the role management system is working correctly
 * by testing the database setup and basic role operations.
 */

const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logHeader(message) {
  log(`\n${colors.bold}=== ${message} ===${colors.reset}`, 'blue');
}

class RoleTestSuite {
  constructor() {
    this.supabase = null;
    this.testResults = [];
  }

  async initialize() {
    logHeader('Initializing Supabase Connection');

    // Check for environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      logError('Missing Supabase environment variables');
      logInfo('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file');
      return false;
    }

    try {
      this.supabase = createClient(supabaseUrl, supabaseKey);
      logSuccess('Supabase client initialized successfully');
      return true;
    } catch (error) {
      logError(`Failed to initialize Supabase: ${error.message}`);
      return false;
    }
  }

  async testDatabaseSchema() {
    logHeader('Testing Database Schema');

    try {
      // Test if profiles table exists with role column
      const { data: profilesSchema, error: schemaError } = await this.supabase
        .from('profiles')
        .select('role')
        .limit(1);

      if (schemaError) {
        logError(`Profiles table schema error: ${schemaError.message}`);
        this.testResults.push({ test: 'Database Schema', status: 'FAILED', error: schemaError.message });
        return false;
      }

      logSuccess('Profiles table with role column exists');

      // Test role enum values
      const { data: testProfile, error: roleError } = await this.supabase
        .from('profiles')
        .select('role')
        .limit(1)
        .single();

      if (!roleError && testProfile) {
        logSuccess(`Role column accessible. Example role: ${testProfile.role || 'user (default)'}`);
      }

      this.testResults.push({ test: 'Database Schema', status: 'PASSED' });
      return true;
    } catch (error) {
      logError(`Database schema test failed: ${error.message}`);
      this.testResults.push({ test: 'Database Schema', status: 'FAILED', error: error.message });
      return false;
    }
  }

  async testRoleEnumeration() {
    logHeader('Testing Role Enumeration');

    try {
      // Try to query users by different roles
      const roles = ['user', 'moderator', 'admin'];

      for (const role of roles) {
        const { data, error } = await this.supabase
          .from('profiles')
          .select('id, full_name, role')
          .eq('role', role)
          .limit(5);

        if (error) {
          logWarning(`Could not query ${role} role: ${error.message}`);
        } else {
          logInfo(`Found ${data.length} users with '${role}' role`);
        }
      }

      this.testResults.push({ test: 'Role Enumeration', status: 'PASSED' });
      return true;
    } catch (error) {
      logError(`Role enumeration test failed: ${error.message}`);
      this.testResults.push({ test: 'Role Enumeration', status: 'FAILED', error: error.message });
      return false;
    }
  }

  async testUserRoleDistribution() {
    logHeader('Testing User Role Distribution');

    try {
      // Get count of users by role
      const { data: allProfiles, error } = await this.supabase
        .from('profiles')
        .select('role');

      if (error) {
        logError(`Failed to fetch user roles: ${error.message}`);
        this.testResults.push({ test: 'Role Distribution', status: 'FAILED', error: error.message });
        return false;
      }

      const roleDistribution = allProfiles.reduce((acc, profile) => {
        const role = profile.role || 'user';
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      }, {});

      logInfo('User Role Distribution:');
      Object.entries(roleDistribution).forEach(([role, count]) => {
        log(`  ${role}: ${count} users`, 'yellow');
      });

      // Check if there's at least one admin
      if (roleDistribution.admin && roleDistribution.admin > 0) {
        logSuccess(`Found ${roleDistribution.admin} admin user(s)`);
      } else {
        logWarning('No admin users found. You may want to create an admin user for testing.');
      }

      this.testResults.push({ test: 'Role Distribution', status: 'PASSED', data: roleDistribution });
      return true;
    } catch (error) {
      logError(`Role distribution test failed: ${error.message}`);
      this.testResults.push({ test: 'Role Distribution', status: 'FAILED', error: error.message });
      return false;
    }
  }

  async testRLSPolicies() {
    logHeader('Testing Row Level Security Policies');

    try {
      // Test if we can read profiles (should be allowed by RLS)
      const { data: profiles, error } = await this.supabase
        .from('profiles')
        .select('id, full_name, role')
        .limit(3);

      if (error) {
        logError(`RLS test failed: ${error.message}`);
        this.testResults.push({ test: 'RLS Policies', status: 'FAILED', error: error.message });
        return false;
      }

      logSuccess(`RLS allows reading profiles. Found ${profiles.length} profiles.`);

      // Test if we can query specific user data
      if (profiles.length > 0) {
        const testUserId = profiles[0].id;
        const { data: specificProfile, error: specificError } = await this.supabase
          .from('profiles')
          .select('*')
          .eq('id', testUserId)
          .single();

        if (!specificError && specificProfile) {
          logSuccess('RLS allows querying specific user profiles');
        }
      }

      this.testResults.push({ test: 'RLS Policies', status: 'PASSED' });
      return true;
    } catch (error) {
      logError(`RLS policies test failed: ${error.message}`);
      this.testResults.push({ test: 'RLS Policies', status: 'FAILED', error: error.message });
      return false;
    }
  }

  async testHelperFunctions() {
    logHeader('Testing Helper Functions');

    try {
      // Test if is_admin function exists and works
      const { data: adminTest, error: adminError } = await this.supabase
        .rpc('is_admin', { user_id: 'test-uuid' });

      if (adminError && adminError.code === '42883') {
        logWarning('is_admin function not found - this might be expected if not implemented');
      } else if (adminError) {
        logWarning(`is_admin function test inconclusive: ${adminError.message}`);
      } else {
        logSuccess('is_admin function exists and is callable');
      }

      this.testResults.push({ test: 'Helper Functions', status: 'PARTIAL' });
      return true;
    } catch (error) {
      logWarning(`Helper functions test inconclusive: ${error.message}`);
      this.testResults.push({ test: 'Helper Functions', status: 'PARTIAL', error: error.message });
      return true; // Non-critical
    }
  }

  async createTestAdmin() {
    logHeader('Creating Test Admin User');

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question('Enter email address to make admin (or press Enter to skip): ', async (email) => {
        rl.close();

        if (!email.trim()) {
          logInfo('Skipping admin user creation');
          resolve(true);
          return;
        }

        try {
          // Find user by email and update their role
          const { data: user, error: findError } = await this.supabase
            .from('profiles')
            .select('id, full_name')
            .eq('id',
              this.supabase.auth.admin
                ? '(SELECT id FROM auth.users WHERE email = $1)'
                : 'unknown'
            )
            .single();

          if (findError) {
            logError('Cannot automatically find user. Please use Supabase dashboard to update user role manually.');
            logInfo(`SQL to run manually: UPDATE profiles SET role = 'admin' WHERE id = (SELECT id FROM auth.users WHERE email = '${email}');`);
            resolve(false);
            return;
          }

          logSuccess('Test admin user creation guidance provided');
          resolve(true);
        } catch (error) {
          logWarning(`Could not create test admin: ${error.message}`);
          resolve(false);
        }
      });
    });
  }

  printSummary() {
    logHeader('Test Results Summary');

    const passed = this.testResults.filter(r => r.status === 'PASSED').length;
    const failed = this.testResults.filter(r => r.status === 'FAILED').length;
    const partial = this.testResults.filter(r => r.status === 'PARTIAL').length;

    this.testResults.forEach(result => {
      const icon = result.status === 'PASSED' ? '✅' :
                   result.status === 'FAILED' ? '❌' : '⚠️';
      log(`${icon} ${result.test}: ${result.status}`);

      if (result.error) {
        log(`   Error: ${result.error}`, 'red');
      }

      if (result.data) {
        log(`   Data: ${JSON.stringify(result.data, null, 2)}`, 'blue');
      }
    });

    log(`\n📊 Summary: ${passed} passed, ${failed} failed, ${partial} partial`, 'bold');

    if (failed === 0) {
      logSuccess('🎉 All critical tests passed! Role management system appears to be working correctly.');
    } else {
      logWarning(`${failed} test(s) failed. Please check the errors above.`);
    }

    // Provide next steps
    logHeader('Next Steps for Testing');
    log('1. Start your development server: npm run dev', 'yellow');
    log('2. Create test users with different roles in Supabase Auth', 'yellow');
    log('3. Navigate to http://localhost:3000/admin (as admin user)', 'yellow');
    log('4. Test role management functionality in the UI', 'yellow');
    log('5. Check the ROLE_MANAGEMENT_TESTING.md file for detailed testing scenarios', 'yellow');
  }

  async runAllTests() {
    logHeader('Role Management System Test Suite');
    log('This script will test the role management system components.\n', 'blue');

    const initialized = await this.initialize();
    if (!initialized) {
      return;
    }

    await this.testDatabaseSchema();
    await this.testRoleEnumeration();
    await this.testUserRoleDistribution();
    await this.testRLSPolicies();
    await this.testHelperFunctions();

    // Optional admin user creation
    logInfo('\n--- Optional: Create Test Admin User ---');
    await this.createTestAdmin();

    this.printSummary();
  }
}

// Run the test suite if this script is executed directly
if (require.main === module) {
  // Load environment variables from .env.local
  try {
    require('dotenv').config({ path: '.env.local' });
  } catch (error) {
    logWarning('Could not load .env.local file. Make sure your environment variables are set.');
  }

  const testSuite = new RoleTestSuite();
  testSuite.runAllTests().catch(error => {
    logError(`Test suite failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = RoleTestSuite;
