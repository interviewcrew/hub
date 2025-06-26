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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mockSelectChain(fromValue: any) {
  const from = vi.fn().mockResolvedValue(fromValue);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mockDb.select.mockReturnValue({ from } as any);
  return { from };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mockSelectError(error: any) {
  const from = vi.fn().mockRejectedValue(error);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mockDb.select.mockReturnValue({ from } as any);
  return { from };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mockSelectWithWhereChain(whereValue: any) {
  const where = vi.fn().mockResolvedValue(whereValue);
  const from = vi.fn().mockReturnValue({ where });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mockDb.select.mockReturnValue({ from } as any);
  return { from, where };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mockSelectWithWhereError(error: any) {
  const where = vi.fn().mockRejectedValue(error);
  const from = vi.fn().mockReturnValue({ where });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mockDb.select.mockReturnValue({ from } as any);
  return { from, where };
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