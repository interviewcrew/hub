import { vi, Mock } from 'vitest';

type MockedTable = {
  findFirst: Mock;
  findMany: Mock;
};

/**
 * A cache to store the dynamically created mocks for each table.
 * This ensures that within a single test, accessing `mockDb.query.users` multiple times
 * will return the exact same mock object, preserving any state or spy assertions.
 * The key is the table name (e.g., 'users'), and the value is the mock object.
 */
const queryMocksCache = new Map<string | symbol, MockedTable>();

/**
 * A Proxy handler for `mockDb.query`.
 * This allows us to intercept any property access on `mockDb.query` (e.g., `mockDb.query.users`).
 * Instead of needing to define every possible table mock, we dynamically generate a mock
 * on the fly for any table that is accessed.
 */
const queryProxyHandler: ProxyHandler<Record<string, unknown>> = {
  /**
   * The `get` trap is called whenever a property of the target object is accessed.
   * @param target The original object (in this case, an empty object).
   * @param prop The name of the property being accessed (e.g., 'positions').
   */
  get(target, prop) {
    // If a mock for this table already exists in our cache, return it.
    if (queryMocksCache.has(prop)) {
      return queryMocksCache.get(prop);
    }
    // If no mock exists, create a new one with `findFirst` and `findMany` spies.
    const newMock: MockedTable = {
      findFirst: vi.fn(),
      findMany: vi.fn(),
    };
    // Store the new mock in the cache for future access.
    queryMocksCache.set(prop, newMock);
    return newMock;
  },
};

/**
 * A deeply mocked object that simulates the Drizzle `db` instance for testing purposes.
 * It includes standard Drizzle functions and a dynamic `query` object.
 */
export const mockDb = {
  insert: vi.fn(),
  select: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  /**
   * Mocks the `db.transaction()` method. It immediately invokes the callback,
   * passing itself as the transactional database instance, to simulate a successful transaction.
   */
  transaction: vi.fn(async (callback) => callback(mockDb)),
  /**
   * A generic mock for `db.query` using a Proxy. This avoids having to manually
   * mock every table (e.g., `db.query.positions`, `db.query.users`). Any property
   * accessed on `mockDb.query` will dynamically return a mock object with
   * `findFirst` and `findMany` methods.
   */
  query: new Proxy({}, queryProxyHandler),
};

/**
 * Resets all spies and mocks on the `mockDb` object to their initial state.
 * This is crucial for ensuring that tests are isolated from each other.
 * It should be called in a `beforeEach` or `afterEach` block in test files.
 */
export function resetDbMocks() {
  mockDb.insert.mockReset();
  mockDb.select.mockReset();
  mockDb.update.mockReset();
  mockDb.delete.mockReset();
  mockDb.transaction.mockReset();

  // Reset all dynamically created query mocks.
  queryMocksCache.forEach((table) => {
    // `table` here is the mock object with { findFirst, findMany }
    Object.values(table).forEach((mockFn: Mock) => mockFn.mockReset());
  });
  // Clear the cache to ensure mocks are fresh for the next test.
  queryMocksCache.clear();
}

// Mock chain helpers
export function mockInsertChain(returningValue: unknown) {
  const chain = createChainableMock(returningValue);
  const returning = vi.fn().mockReturnValue(chain);
  const values = vi.fn().mockReturnValue({ returning });
  mockDb.insert.mockReturnValueOnce({ values } as never);
  return { returning, values };
}

export function mockInsertError(error: Error) {
  const chain = createChainableMock(null, error);
  const returning = vi.fn().mockReturnValue(chain);
  const values = vi.fn().mockReturnValue({ returning });
  mockDb.insert.mockReturnValueOnce({ values } as never);
  return { returning, values };
}

// A flexible mock that can handle various chaining.
function createChainableMock(finalValue: unknown, error: Error | null = null) {
  const then = (
    onFulfilled: (value: unknown) => unknown,
    onRejected: (reason: unknown) => unknown,
  ) => {
    if (error) {
      return Promise.reject(error).catch(onRejected);
    }
    return Promise.resolve(finalValue).then(onFulfilled);
  };

  const chain = {
    where: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    then,
  };

  return chain;
}

export function mockSelectChain(fromValue: unknown) {
  const mock = createChainableMock(fromValue);

  mockDb.select.mockReturnValueOnce(mock as never);
  return { from: mock.from, where: mock.where, orderBy: mock.orderBy };
}

export function mockSelectError(error: Error) {
  const mock = createChainableMock(null, error);

  mockDb.select.mockReturnValueOnce(mock as never);
  return { from: mock.from, where: mock.where, orderBy: mock.orderBy };
}

export function mockSelectWithWhereChain(whereValue: unknown) {
  const mock = createChainableMock(whereValue);

  mockDb.select.mockReturnValueOnce(mock as never);
  return { from: mock.from, where: mock.where, orderBy: mock.orderBy };
}

export function mockSelectWithWhereError(error: Error) {
  const mock = createChainableMock(null, error);

  mockDb.select.mockReturnValueOnce(mock as never);
  return { from: mock.from, where: mock.where, orderBy: mock.orderBy };
}

export function mockUpdateChain(returningValue: unknown) {
  const chain = createChainableMock(returningValue);
  const returning = vi.fn().mockReturnValue(chain);
  const where = vi.fn().mockReturnValue({ ...chain, returning });
  const set = vi.fn().mockReturnValue({ where });
  mockDb.update.mockReturnValueOnce({ set } as never);
  return { set, where, returning };
}

export function mockUpdateError(error: Error) {
  const chain = createChainableMock(null, error);
  const returning = vi.fn().mockReturnValue(chain);
  const where = vi.fn().mockReturnValue({ ...chain, returning });
  const set = vi.fn().mockReturnValue({ where });
  mockDb.update.mockReturnValueOnce({ set } as never);
  return { set, where, returning };
}

export function mockDeleteChain(returningValue: unknown) {
  const chain = createChainableMock(returningValue);
  const returning = vi.fn().mockReturnValue(chain);
  const where = vi.fn().mockReturnValue({ ...chain, returning });
  mockDb.delete.mockReturnValueOnce({ where } as never);
  return { where, returning };
}

export function mockDeleteError(error: Error) {
  const chain = createChainableMock(null, error);
  const returning = vi.fn().mockReturnValue(chain);
  const where = vi.fn().mockReturnValue({ ...chain, returning });
  mockDb.delete.mockReturnValueOnce({ where } as never);
  return { where, returning };
}
