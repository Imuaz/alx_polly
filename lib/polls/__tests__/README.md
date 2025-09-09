# Poll Actions Test Suite

This directory contains the refactored test suite for poll actions, organized into focused, maintainable test files.

## File Structure

```
__tests__/
├── setup.ts              # Global test setup and configuration
├── createPoll.test.ts     # Tests for poll creation functionality
├── votePoll.test.ts       # Tests for voting functionality
├── deletePoll.test.ts     # Tests for poll deletion functionality
├── getPolls.test.ts       # Tests for fetching multiple polls
├── getPoll.test.ts        # Tests for fetching single poll
├── getUserPolls.test.ts   # Tests for fetching user's polls
├── integration.test.ts    # Integration and workflow tests
└── README.md             # This file
```

## Test Utilities

The test suite uses a comprehensive set of utilities located in `lib/__mocks__/test-utils.ts`:

### Mock Helpers
- `mockAuthUser(userId)` - Mock authenticated user
- `mockAuthNone()` - Mock unauthenticated state
- `setupCommonMocks()` - Reset and setup default mocks
- `setSupabaseReturn(client)` - Configure Supabase client mock

### Data Builders
- `buildPollFormData(overrides)` - Create FormData for poll creation
- `createMockPoll(overrides)` - Generate mock poll data
- `createMockPolls(count)` - Generate multiple mock polls

### Query Builders
- `makeSelectable(result)` - Create chainable query mock
- `buildMockQuery(data, error)` - Create full query mock
- `buildInsertMock(returnData)` - Create insert operation mock

## Test Organization

### Unit Tests
Each function has its own test file with comprehensive coverage:
- **Success scenarios** - Happy path functionality
- **Validation errors** - Input validation and business rules
- **Authentication errors** - Auth requirements and failures
- **Database errors** - Error handling and recovery

### Integration Tests
The `integration.test.ts` file covers:
- Complete workflows (create → vote → delete)
- Concurrent operations
- Error recovery scenarios
- Complex data scenarios

## Running Tests

```bash
# Run all poll action tests
npm test lib/polls/__tests__

# Run specific test file
npm test lib/polls/__tests__/createPoll.test.ts

# Run with coverage
npm test -- --coverage lib/polls/__tests__

# Run in watch mode
npm test -- --watch lib/polls/__tests__
```

## Best Practices

### Test Structure
- Use `describe` blocks to group related tests
- Use descriptive test names that explain the scenario
- Follow Arrange-Act-Assert pattern
- Use `beforeEach` for common setup

### Mocking
- Use helper functions instead of inline mocks
- Reset mocks in `beforeEach` via `setupCommonMocks()`
- Verify mock calls with specific arguments
- Use builders for consistent test data

### Assertions
- Test both success and error cases
- Verify side effects (redirects, revalidations)
- Check argument values passed to mocks
- Test data transformations

## Migration from Original Test

The original monolithic test file has been split and refactored:

1. **Extracted common utilities** to `test-utils.ts`
2. **Split by functionality** into focused test files
3. **Improved readability** with better organization
4. **Enhanced maintainability** with reusable helpers
5. **Preserved coverage** - all original tests maintained

## Adding New Tests

When adding new tests:

1. Choose the appropriate test file based on functionality
2. Use existing helpers from `test-utils.ts`
3. Follow the established patterns for mocking and assertions
4. Add integration tests for complex workflows
5. Update this README if adding new test files
