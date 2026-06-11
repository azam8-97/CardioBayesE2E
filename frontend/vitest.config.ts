import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    // Statically replace jest.mock() with vi.mock() in test files so Vitest
    // hoists them correctly (it only recognises vi.mock() in its AST pass).
    {
      name: 'jest-mock-to-vi-mock',
      enforce: 'pre' as const,
      transform(code: string, id: string) {
        if (!id.match(/\/tests\/.*\.[tj]sx?$/)) return
        return {
          code: code
            // Hoist jest.mock() like vi.mock()
            .replace(/\bjest\.mock\(/g, 'vi.mock(')
            // Inside mock factories, require() synchronously loads the real module
            .replace(/\bjest\.requireActual\(/g, 'require('),
        }
      },
    },
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.ts',
    include: ['tests/**/*.test.{ts,tsx}', 'tests/**/*.spec.{ts,tsx}'],
    exclude: ['tests/e2e/**', 'node_modules/**']
  }
})
