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
    // Disable compressed size reporting to speed up build
    reportCompressedSize: false,
    // Reduce memory usage
    target: 'es2015',
    // Optimize for faster builds
    cssCodeSplit: true,
    rollupOptions: {
      // Limit parallel operations to prevent hanging
      maxParallelFileOps: 1,
      output: {
        // Simplified chunk splitting to prevent build hangs
        manualChunks: (id) => {
          // Only split large vendor libraries
          if (id.includes('node_modules')) {
            // React and React DOM together
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            // LiveKit is large, separate it
            if (id.includes('@livekit') || id.includes('livekit-client')) {
              return 'vendor-livekit';
            }
            // Everything else in one vendor chunk
            return 'vendor';
          }
        },
        // Optimize chunk file names
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      },
      // Reduce tree-shaking complexity
      treeshake: {
        preset: 'smallest',
        moduleSideEffects: false
      }
    },
    // Optimize for lower memory usage
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    }
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
