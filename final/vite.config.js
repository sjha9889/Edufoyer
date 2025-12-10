import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {},
    '__APP_TITLE__': JSON.stringify('EduFoyer - Learn Together, Earn Together')
  },
  base: '/', // Use absolute paths from root for domain deployment
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild', // Faster than terser, built into Vite
    chunkSizeWarningLimit: 1000,
    // Simplified chunking to avoid circular dependency issues
    rollupOptions: {
      output: {
        // Simplified manual chunks - only split large vendors to avoid circular deps
        manualChunks(id) {
          // Only split very large libraries, let Vite handle the rest
          if (id.includes('node_modules')) {
            // React and React DOM together
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            // Everything else in one vendor chunk to avoid circular deps
            return 'vendor';
          }
        },
        // Optimize chunk file names
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    },
    // Increase build timeout
    reportCompressedSize: false,
    // Reduce memory usage
    target: 'es2015'
  },
  server: {
    port: Number(process.env.PORT) || 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
