import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts', // Optional: if you need global test setup
    css: true, // If you import CSS files in your components
    alias: {
      '@/': new URL('./src/', import.meta.url).pathname,
    },
  },
});
