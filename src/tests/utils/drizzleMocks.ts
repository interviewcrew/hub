import { vi } from 'vitest';
import { db } from '@/lib/db';

export const mockDb = vi.mocked(db);

// Helper to reset all mocks
export function resetDbMocks() {
  mockDb.insert.mockReset();
  mockDb.select.mockReset();
  mockDb.update.mockReset();
  mockDb.delete.mockReset();
}

// Mock chain helpers
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mockInsertChain(returningValue: any) {
  const returning = vi.fn().mockResolvedValue(returningValue);
  const values = vi.fn().mockReturnValue({ returning });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mockDb.insert.mockReturnValue({ values } as any);
  return { returning, values };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mockInsertError(error: any) {
  const returning = vi.fn().mockRejectedValue(error);
  const values = vi.fn().mockReturnValue({ returning });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mockDb.insert.mockReturnValue({ values } as any);
  return { returning, values };
}

// A flexible mock that can handle various chaining.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createChainableMock(finalValue: any, error: any = null) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const then = (onFulfilled: any, onRejected: any) => {
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mockSelectChain(fromValue: any) {
  const mock = createChainableMock(fromValue);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mockDb.select.mockReturnValueOnce(mock as any);
  return { from: mock.from, where: mock.where, orderBy: mock.orderBy };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mockSelectError(error: any) {
  const mock = createChainableMock(null, error);

   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mockDb.select.mockReturnValueOnce(mock as any);
  return { from: mock.from, where: mock.where, orderBy: mock.orderBy };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mockSelectWithWhereChain(whereValue: any) {
  const mock = createChainableMock(whereValue);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mockDb.select.mockReturnValueOnce(mock as any);
  return { from: mock.from, where: mock.where, orderBy: mock.orderBy };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mockSelectWithWhereError(error: any) {
  const mock = createChainableMock(null, error);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mockDb.select.mockReturnValueOnce(mock as any);
  return { from: mock.from, where: mock.where, orderBy: mock.orderBy };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mockUpdateChain(returningValue: any) {
  const returning = vi.fn().mockResolvedValue(returningValue);
  const where = vi.fn().mockReturnValue({ returning });
  const set = vi.fn().mockReturnValue({ where });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mockDb.update.mockReturnValue({ set } as any);
  return { set, where, returning };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mockUpdateError(error: any) {
  const returning = vi.fn().mockRejectedValue(error);
  const where = vi.fn().mockReturnValue({ returning });
  const set = vi.fn().mockReturnValue({ where });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mockDb.update.mockReturnValue({ set } as any);
  return { set, where, returning };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mockDeleteChain(returningValue: any) {
  const returning = vi.fn().mockResolvedValue(returningValue);
  const where = vi.fn().mockReturnValue({ returning });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mockDb.delete.mockReturnValue({ where } as any);
  return { where, returning };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mockDeleteError(error: any) {
  const returning = vi.fn().mockRejectedValue(error);
  const where = vi.fn().mockReturnValue({ returning });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mockDb.delete.mockReturnValue({ where } as any);
  return { where, returning };
} 