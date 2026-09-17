import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration.
// Base path is read from an environment variable so the same build can be
// deployed at the domain root or under a sub-path without code changes.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || '/',
  server: {
    port: 5173,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
