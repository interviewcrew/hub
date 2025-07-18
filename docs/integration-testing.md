# Integration Testing with Transaction Rollback

This project uses a sophisticated integration testing setup that provides database isolation through transaction rollback. This approach ensures tests run fast while maintaining complete isolation between test cases.

## Overview

- **Unit Tests**: Fast tests with mocked dependencies (`*.test.ts` files)
- **Integration Tests**: Tests with real database using transaction rollback (`*.integration.test.ts` files)
- **Isolation Strategy**: Each integration test runs in its own database transaction that gets rolled back after completion

## Key Benefits

✅ **Speed**: Transaction rollback is much faster than truncating tables  
✅ **Isolation**: Each test runs in complete isolation with a clean database state  
✅ **Reliability**: No test pollution or race conditions between tests  
✅ **Simplicity**: Tests look like normal tests, isolation is handled automatically

## Setup Requirements

### 1. Environment Configuration

Create a `.env.test` file in the project root:

```env
# Test Environment Variables
DATABASE_URL="postgresql://user:password@localhost:5433/interviewcrew_test"
NODE_ENV=test
```

### 2. Test Database

The project includes a test database service in Docker Compose:

```bash
# Start test database (runs on port 5433)
npm run db:test:start

# Stop test database
npm run db:test:stop
```

## Running Tests

### Unit Tests (Fast, Mocked)

```bash
# Run unit tests (default for development)
npm test
npm run test:unit

# Run with UI
npm run test:ui
```

### Integration Tests (Real Database)

```bash
# Run integration tests only
npm run test:integration

# Run with UI
npm run test:integration:ui

# Run full integration test suite (includes DB setup/teardown)
npm run test:integration:full
```

### All Tests

```bash
# Run both unit and integration tests
npm run test:all
```

## Writing Integration Tests

### File Naming Convention

Integration test files must end with `.integration.test.ts` to be picked up by the integration test runner.

### Test Structure

Integration tests automatically receive a transactional database connection in the test context:

```typescript
import { describe, it, expect } from 'vitest';
import { eq } from 'drizzle-orm';
import { accountManagers } from '@/db/schema';
import { createAccountManager } from './accountManagers';

describe('Account Manager Integration Tests', () => {
  it('should create and retrieve data with real database', async ({ db }) => {
    // The 'db' parameter is a transactional database connection
    // All operations in this test will be rolled back automatically

    // Act: Use server actions or direct database operations
    const result = await createAccountManager({
      name: 'John Doe',
      email: 'john@example.com',
    });

    // Assert: Verify both server action response and database state
    expect(result.success).toBe(true);

    // Direct database verification
    const records = await db
      .select()
      .from(accountManagers)
      .where(eq(accountManagers.email, 'john@example.com'));

    expect(records).toHaveLength(1);
    expect(records[0].name).toBe('John Doe');
  });

  it('should start with clean database state', async ({ db }) => {
    // This test won't see any data from the previous test
    // because each test runs in its own transaction

    const allRecords = await db.select().from(accountManagers);
    expect(allRecords).toHaveLength(0);
  });
});
```

### Test Context

The integration test setup automatically provides:

- `db`: Transactional database connection (Drizzle instance)
- Automatic transaction rollback after each test
- Database migrations run before all tests
- Clean database state for each test

### Best Practices

#### ✅ Do:

- Use descriptive test names that explain the business scenario
- Test complete workflows (create → read → update → delete)
- Verify both server action responses AND database state
- Test validation errors and edge cases
- Use the `db` context parameter for direct database queries

#### ❌ Don't:

- Try to share data between tests (each test is isolated)
- Manually manage transactions (handled automatically)
- Use `beforeEach`/`afterEach` for database cleanup (not needed)
- Mix unit test mocks with integration tests

## CI/CD Integration

### Pre-commit Hooks

Pre-commit hooks run **unit tests only** for fast feedback:

```bash
# .husky/pre-commit runs:
npm run test:unit
```

### CI Pipeline Recommendation

Structure your CI pipeline to run tests in stages:

```yaml
# Example GitHub Actions workflow
jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - name: Run Unit Tests
        run: npm run test:unit

  integration-tests:
    runs-on: ubuntu-latest
    needs: unit-tests
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: password
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - name: Run Integration Tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:password@localhost:5432/test_db
```

## Troubleshooting

### Database Connection Issues

```bash
# Check if test database is running
docker ps | grep test_db

# View database logs
docker logs hub_test_db_1

# Reset test database
npm run db:test:stop
npm run db:test:start
```

### Migration Issues

```bash
# If migrations fail, check the database schema
npm run db:studio

# Reset and re-run migrations
npm run db:test:stop
docker volume rm hub_test_postgres_data
npm run db:test:start
```

### Test Timeout Issues

Integration tests have longer timeouts configured:

- Test timeout: 30 seconds
- Hook timeout: 10 seconds

If tests still timeout, check:

1. Database connectivity
2. Migration completion
3. Test complexity

## Architecture Details

### Transaction Rollback Strategy

The integration test setup uses Drizzle's transaction method to provide isolation:

1. **Before Each Test**: Start a new database transaction
2. **During Test**: All operations use the transactional connection
3. **After Each Test**: Transaction is automatically rolled back
4. **Database State**: Returns to clean state for next test

This is implemented in `src/tests/integration.setup.ts` and provides:

- Automatic cleanup without manual table truncation
- Preservation of sequences and constraints
- Maximum performance for test isolation
- Simple test writing experience

### Performance Characteristics

- **Unit Tests**: ~100-500ms per test (mocked)
- **Integration Tests**: ~50-200ms per test (real DB with rollback)
- **Traditional Integration**: ~500-2000ms per test (table truncation)

The transaction rollback strategy provides integration test performance that's nearly as fast as unit tests while maintaining full database fidelity.
