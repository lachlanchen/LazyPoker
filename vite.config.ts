import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { appPort } from './src/config/runtime'

export default defineConfig({
  plugins: [react()],
  server: { host: '127.0.0.1', port: appPort, strictPort: true },
  preview: { host: '127.0.0.1', port: appPort, strictPort: true },
  test: { environment: 'jsdom', setupFiles: ['./src/test/setup.ts'] },
})
