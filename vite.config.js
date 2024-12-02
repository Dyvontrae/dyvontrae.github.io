import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  base: '/',  // Keep this as '/' since your site is at root level
  plugins: [react()],
  build: {
    outDir: 'dist'
  },
  server: {
    historyApiFallback: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@lib': path.resolve(__dirname, './src/lib')
    }
  }
});