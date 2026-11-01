// client/vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  base: "/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    port: Number(process.env.PORT) || 5173,
    strictPort: false,
    // Allow tunnels / preview domains to reach the dev server
    allowedHosts: true,
    proxy: {
      "/api": {
        target: process.env.VITE_DEV_API_TARGET || "http://127.0.0.1:5000",
        changeOrigin: true,
      },
      "/uploads": {
        target: process.env.VITE_DEV_API_TARGET || "http://127.0.0.1:5000",
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: true,
    port: Number(process.env.PORT) || 4173,
    allowedHosts: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'utils': ['axios', 'date-fns', 'clsx'],
          'ui': ['framer-motion', '@heroicons/react', '@headlessui/react'],
        }
      }
    },
    copyPublicDir: true
  }
});