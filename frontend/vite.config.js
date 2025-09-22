// Import Vite's configuration helper function
import { defineConfig } from 'vite'
// Import React plugin for Vite to handle JSX and React features
import react from '@vitejs/plugin-react'

/**
 * Vite Configuration File
 * Configures the build tool and development server settings
 * Official documentation: https://vite.dev/config/
 */
export default defineConfig({
  plugins: [
    react() // Enable React support with JSX transformation and Fast Refresh
  ],
  // Additional configuration options can be added here:
  // - server: Development server settings (port, host, proxy, etc.)
  // - build: Production build settings (output directory, minification, etc.)
  // - resolve: Module resolution settings (aliases, extensions, etc.)
})
