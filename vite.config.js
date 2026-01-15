import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11']
    })
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        intentLogger: resolve(__dirname, 'intent_logger.html'),
        habitTracker: resolve(__dirname, 'habit_tracker.html'),
        split: resolve(__dirname, 'split.html')
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
