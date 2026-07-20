import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/pdf-magic/',
  build: { outDir: 'dist', sourcemap: false },
});
