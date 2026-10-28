import { defineConfig } from 'vite';
export default defineConfig({
  base: './',
  esbuild: { jsx: 'automatic' },
  build: { target: 'es2022', sourcemap: false },
  server: { port: 5184, strictPort: true },
  preview: { port: 4184, strictPort: true }
});
