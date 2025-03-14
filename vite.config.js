import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    open: '/', // Auto-open the browser on start
  },
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
      },
    },
  },
}); 