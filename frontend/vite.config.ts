import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: process.env.VITE_HALO_API_BASE_URL,
        changeOrigin: true,
        secure: false
      }
    }
  },
  optimizeDeps: {
    include: ['amazon-connect-streams']
  },
  build: {
    outDir: 'build',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'mui-vendor': ['@mui/material', '@emotion/react', '@emotion/styled'],
          'connect-vendor': ['amazon-connect-streams']
        }
      }
    }
  }
})