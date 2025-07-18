// vite.config.ts

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  publicDir: path.resolve(__dirname, 'public'),
  plugins: [react()],
  resolve: {
    alias: {
      '@':     path.resolve(__dirname, 'src'),
      'utils': path.resolve(__dirname, 'src/utils'),
      'types': path.resolve(__dirname, 'src/types.ts'),
    },
  },
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html')
    }
  }
})
