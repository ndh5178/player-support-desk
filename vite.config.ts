import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const usesRealApi = env.VITE_ENABLE_MOCKS === 'false'

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: usesRealApi
      ? {
          proxy: {
            '/api': {
              target: env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:8080',
              changeOrigin: true,
            },
          },
        }
      : undefined,
    test: {
      environment: 'jsdom',
      setupFiles: ['./tests/setup.ts'],
    },
  }
})
