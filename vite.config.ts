import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      "@": resolve(fileURLToPath(new URL('./src', import.meta.url))),
    },
  },
  build: {
    rollupOptions: {
      input: {
        sidepanel: resolve(fileURLToPath(new URL('.', import.meta.url)), 'sidepanel.html'),
        options: resolve(fileURLToPath(new URL('.', import.meta.url)), 'options.html'),
        background: resolve(fileURLToPath(new URL('./src', import.meta.url)), 'background.ts'),
        content: resolve(fileURLToPath(new URL('./src', import.meta.url)), 'content.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    }
  }
})
