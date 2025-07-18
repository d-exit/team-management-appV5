// vite.config.ts
import { defineConfig } from 'vite'
import react       from '@vitejs/plugin-react'
import path        from 'path'

export default defineConfig({
  // 「src/ がプロジェクトのルートだよ」と教えてあげる
  root: path.resolve(__dirname, 'src'),

  // publicDir をプロジェクト直下の public/ に戻す
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
    // ビルド成果物をルート直下の dist/ に出力
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
    // ここで「src/index.html を入口として使ってね」と Rollup に教える
    rollupOptions: {
      input: path.resolve(__dirname, 'src/index.html')
    }
  }
})
