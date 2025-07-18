import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: 'node', // Use node environment for integration tests
    setupFiles: './src/tests/integration.setup.ts', // Separate setup for integration tests
    testTimeout: 30000, // Longer timeout for integration tests
    hookTimeout: 10000, // Longer timeout for setup/teardown hooks
    pool: 'forks', // Use separate processes for better isolation
    poolOptions: {
      forks: {
        singleFork: true, // Run tests sequentially to avoid database conflicts
      },
    },
    include: ['**/*.integration.test.ts'], // Only run files with .integration.test.ts extension
    alias: {
      '@/': new URL('./src/', import.meta.url).pathname,
    },
    // Don't mock anything - use real implementations
    unstubGlobals: true,
    mockReset: false,
    clearMocks: false,
    restoreMocks: false,
  },
});
