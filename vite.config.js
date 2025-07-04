import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      fastRefresh: {
        verbose: true,
      },
    }),
  ],
  server: {
    port: 5173,
  },
});