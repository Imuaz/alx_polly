#!/usr/bin/env node

/**
 * Test runner script for the refactored poll actions test suite
 * This script validates that all refactored test files are properly structured
 */

const fs = require('fs');
const path = require('path');

const testDir = path.join(__dirname, '../lib/polls/__tests__');
const expectedFiles = [
  'createPoll.test.ts',
  'votePoll.test.ts', 
  'deletePoll.test.ts',
  'getPolls.test.ts',
  'getPoll.test.ts',
  'getUserPolls.test.ts',
  'integration.test.ts',
  'setup.ts',
  'README.md'
];

console.log('🔍 Validating refactored test suite structure...\n');

let allValid = true;

// Check if all expected files exist
expectedFiles.forEach(file => {
  const filePath = path.join(testDir, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} - exists`);
    
    // Basic validation for test files
    if (file.endsWith('.test.ts')) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for required imports
      if (content.includes('from \'@/lib/__mocks__/test-utils\'')) {
        console.log(`   ✅ Uses test utilities`);
      } else {
        console.log(`   ❌ Missing test utilities import`);
        allValid = false;
      }
      
      // Check for describe blocks
      if (content.includes('describe(')) {
        console.log(`   ✅ Has describe blocks`);
      } else {
        console.log(`   ❌ Missing describe blocks`);
        allValid = false;
      }
      
      // Check for beforeEach setup
      if (content.includes('beforeEach') && content.includes('setupCommonMocks')) {
        console.log(`   ✅ Has proper setup`);
      } else {
        console.log(`   ❌ Missing beforeEach setup`);
        allValid = false;
      }
    }
  } else {
    console.log(`❌ ${file} - missing`);
    allValid = false;
  }
  console.log('');
});

// Check test-utils file
const testUtilsPath = path.join(__dirname, '../lib/__mocks__/test-utils.ts');
if (fs.existsSync(testUtilsPath)) {
  console.log('✅ test-utils.ts - exists');
  
  const content = fs.readFileSync(testUtilsPath, 'utf8');
  const requiredExports = [
    'mockAuthUser',
    'mockAuthNone', 
    'buildPollFormData',
    'setupCommonMocks',
    'makeSelectable',
    'buildMockQuery'
  ];
  
  requiredExports.forEach(exportName => {
    if (content.includes(`export const ${exportName}`) || content.includes(`export function ${exportName}`)) {
      console.log(`   ✅ Exports ${exportName}`);
    } else {
      console.log(`   ❌ Missing export: ${exportName}`);
      allValid = false;
    }
  });
} else {
  console.log('❌ test-utils.ts - missing');
  allValid = false;
}

console.log('\n' + '='.repeat(50));
if (allValid) {
  console.log('🎉 All refactored test files are properly structured!');
  console.log('\nTo run the tests:');
  console.log('npm test lib/polls/__tests__');
} else {
  console.log('❌ Some issues found in the refactored test suite');
  process.exit(1);
}
