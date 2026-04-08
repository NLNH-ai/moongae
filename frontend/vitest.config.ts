import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    include: ['tests/unit/**/*.spec.ts?(x)'],
    css: true,
    clearMocks: true,
    restoreMocks: true,
    mockReset: true,
  },
})
