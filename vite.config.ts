import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/', // Changed from '/dyvontrae.github.io/' to '/'
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});