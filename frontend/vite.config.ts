import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isGitHubPages = env.VITE_GITHUB_PAGES === 'true'

  return {
    base: isGitHubPages ? './' : '/',
    plugins: [react()],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('react-quill') || id.includes('quill')) {
              return 'editor'
            }

            if (id.includes('@tanstack/react-query')) {
              return 'query'
            }

            if (id.includes('node_modules')) {
              return 'vendor'
            }

            if (id.includes('/src/pages/Admin')) {
              return 'admin-pages'
            }

            return undefined
          },
        },
      },
    },
    server: {
      proxy: {
        '/api': 'http://localhost:8080',
        '/uploads': 'http://localhost:8080',
      },
    },
  }
})
