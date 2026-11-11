import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import pkg from './package.json' with { type: 'json' }

// https://vite.dev/config/
export default defineConfig({
  base: './',
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rolldownOptions: {
      output: {
        // Keep third-party libraries in their own cached chunk, separate from app code.
        codeSplitting: {
          groups: [
            { name: 'vendor-react', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
            { name: 'vendor', test: /node_modules[\\/]/ },
          ],
        },
      },
    },
  },
  server: {
    host: true,
    port: 5173,
    watch: {
      ignored: ['**/dist-electron/**', '**/electron/**']
    }
  }
})
