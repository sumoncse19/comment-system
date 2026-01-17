import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],

          // Redux state management
          'redux-vendor': ['@reduxjs/toolkit', 'react-redux'],

          // UI component libraries (Radix UI, etc.)
          'ui-vendor': [
            '@radix-ui/react-alert-dialog',
            'class-variance-authority',
            'clsx',
            'tailwind-merge',
            'lucide-react',
            'next-themes',
          ],

          // Form validation libraries
          'form-vendor': [
            'react-hook-form',
            '@hookform/resolvers',
            'zod',
          ],

          // Other utilities
          'utils-vendor': [
            'axios',
            'socket.io-client',
            'sonner',
          ],
        },
      },
    },
  },
})
