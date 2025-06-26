// Vitest global setup file
// This file runs before all tests

// Set up any global test configuration here
// For example, you might want to set up global mocks, configure testing libraries, etc.

// If you're using React Testing Library, you might want to configure it here
// import '@testing-library/jest-dom';

// Configure any global mocks if needed
// For example, if you're using Next.js router in tests:
// vi.mock('next/router', () => ({
//   useRouter: () => ({
//     push: vi.fn(),
//     replace: vi.fn(),
//     prefetch: vi.fn(),
//     back: vi.fn(),
//     reload: vi.fn(),
//     pathname: '/',
//     query: {},
//     asPath: '/',
//   }),
// }));

import { vi } from 'vitest';

// Mock dependencies
vi.mock('@/lib/db', () => ({
  db: {
    insert: vi.fn(),
    select: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
})); 