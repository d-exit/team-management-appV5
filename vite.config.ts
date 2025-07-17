// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  // 追加：プロジェクトのルートを src/ にする
  root: path.resolve(__dirname, 'src'),

  plugins: [react()],
  resolve: {
    alias: {
      '@':      path.resolve(__dirname, 'src'),
      'utils':  path.resolve(__dirname, 'src/utils'),
      'types':  path.resolve(__dirname, 'src/types.ts'),
    },
  },
  build: {
    // ビルド成果物をルート直下の dist/ に出力
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
})
