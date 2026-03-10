#!/usr/bin/env node

/**
 * Performance Optimization Script for GBChat Client
 * 
 * This script provides various optimization utilities for development:
 * - Bundle analysis
 * - Asset optimization
 * - Cache cleaning
 * - Build optimization
 * - Performance monitoring setup
 */

import { execSync } from 'child_process'
import { existsSync, rmSync, mkdirSync, writeFileSync, readFileSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const PROJECT_ROOT = join(__dirname, '..')
const CLIENT_DIR = PROJECT_ROOT

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function exec(command, options = {}) {
  try {
    execSync(command, { stdio: 'inherit', cwd: CLIENT_DIR, ...options })
    return true
  } catch (error) {
    log(`Error executing: ${command}`, 'red')
    return false
  }
}

// Clean various caches and temp files
function cleanCaches() {
  log('\n🧹 Cleaning caches and temporary files...', 'cyan')
  
  const paths = [
    'node_modules/.vite',
    'node_modules/.cache',
    'dist',
    '.vite',
    'tsconfig.tsbuildinfo',
  ]
  
  let cleaned = 0
  paths.forEach(path => {
    const fullPath = join(CLIENT_DIR, path)
    if (existsSync(fullPath)) {
      try {
        rmSync(fullPath, { recursive: true, force: true })
        log(`  ✓ Cleaned: ${path}`, 'green')
        cleaned++
      } catch (error) {
        log(`  ✗ Failed to clean: ${path}`, 'red')
      }
    }
  })
  
  log(`\n${cleaned} directories cleaned`, 'green')
}

// Analyze bundle size
function analyzeBundle() {
  log('\n📊 Analyzing bundle size...', 'cyan')
  
  // Install bundle analyzer if not present
  log('Installing rollup-plugin-visualizer...', 'yellow')
  exec('npm install -D rollup-plugin-visualizer --save-exact')
  
  // Create temporary vite config with analyzer
  const viteConfig = `
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'utils': ['axios', 'date-fns', 'clsx'],
          'ui': ['framer-motion', '@heroicons/react', '@headlessui/react'],
          'charts': ['chart.js', 'react-chartjs-2'],
          'emoji': ['emoji-mart', '@emoji-mart/data', '@emoji-mart/react'],
          'media': ['howler', 'simple-peer'],
          'realtime': ['socket.io-client', 'react-use-websocket'],
          'state': ['zustand'],
          'ai': ['@google/generative-ai'],
          'payments': ['@stripe/react-stripe-js', '@stripe/stripe-js'],
        }
      }
    }
  }
});
`
  
  writeFileSync(join(CLIENT_DIR, 'vite.config.analyze.js'), viteConfig)
  
  log('Building with bundle analyzer...', 'yellow')
  exec('npx vite build --config vite.config.analyze.js')
  
  log('\n📈 Bundle analysis saved to dist/stats.html', 'green')
  log('Opening analysis in browser...', 'cyan')
  
  // Try to open in browser
  try {
    if (process.platform === 'win32') {
      execSync('start dist/stats.html', { cwd: CLIENT_DIR })
    } else if (process.platform === 'darwin') {
      execSync('open dist/stats.html', { cwd: CLIENT_DIR })
    } else {
      execSync('xdg-open dist/stats.html', { cwd: CLIENT_DIR })
    }
  } catch (error) {
    log('Could not open browser automatically. Open dist/stats.html manually.', 'yellow')
  }
  
  // Clean up temp config
  rmSync(join(CLIENT_DIR, 'vite.config.analyze.js'))
}

// Optimize images (if sharp is available)
function optimizeImages() {
  log('\n🖼️  Optimizing images...', 'cyan')
  
  try {
    exec('npm install -D sharp --save-exact')
    log('Sharp installed successfully', 'green')
  } catch (error) {
    log('Could not install sharp. Skipping image optimization.', 'yellow')
    return
  }
  
  const imageExtensions = ['png', 'jpg', 'jpeg', 'webp']
  const publicDir = join(CLIENT_DIR, 'public')
  
  if (!existsSync(publicDir)) {
    log('Public directory not found', 'yellow')
    return
  }
  
  log('Image optimization requires additional setup. Consider using:', 'yellow')
  log('  - squoosh.app for manual optimization', 'cyan')
  log('  - imagemin for automated optimization', 'cyan')
  log('  - Next.js Image component for automatic optimization', 'cyan')
}

// Generate performance report
function generatePerformanceReport() {
  log('\n📋 Generating performance report...', 'cyan')
  
  const report = {
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    cpus: require('os').cpus().length,
    memory: {
      total: `${Math.round(require('os').totalmem() / 1024 / 1024 / 1024)}GB`,
      free: `${Math.round(require('os').freemem() / 1024 / 1024 / 1024)}GB`,
    },
    recommendations: [
      'Enable React production build for better performance',
      'Use React.lazy() for code splitting',
      'Implement virtual scrolling for long lists',
      'Optimize images and use WebP format',
      'Enable gzip/brotli compression on server',
      'Use service worker for offline support',
      'Implement proper caching strategies',
      'Minimize re-renders with React.memo()',
      'Use useMemo and useCallback for expensive calculations',
      'Consider using React 18 concurrent features',
    ],
  }
  
  writeFileSync(
    join(CLIENT_DIR, 'performance-report.json'),
    JSON.stringify(report, null, 2)
  )
  
  log('\nPerformance Report:', 'magenta')
  console.log(JSON.stringify(report, null, 2))
  log('\nReport saved to performance-report.json', 'green')
}

// Setup performance monitoring
function setupPerformanceMonitoring() {
  log('\n📈 Setting up performance monitoring...', 'cyan')
  
  const monitoringCode = `/**
 * Performance Monitoring Hook
 * 
 * Usage: import { usePerformance } from './hooks/usePerformance'
 */

import { useEffect, useRef } from 'react'

export function usePerformance(componentName) {
  const renderTime = useRef(0)
  const renderCount = useRef(0)
  
  useEffect(() => {
    renderTime.current = performance.now()
    renderCount.current++
    
    return () => {
      const duration = performance.now() - renderTime.current
      if (duration > 16) { // More than one frame
        console.warn(\`[Performance] \${componentName} took \${duration.toFixed(2)}ms to render\`)
      }
    }
  })
  
  // Log render count on unmount
  useEffect(() => {
    return () => {
      console.log(\`[Performance] \${componentName} rendered \${renderCount.current} times\`)
    }
  }, [])
}

/**
 * Performance Monitoring Service
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      fcp: 0, // First Contentful Paint
      lcp: 0, // Largest Contentful Paint
      fid: 0, // First Input Delay
      cls: 0, // Cumulative Layout Shift
    }
    this.init()
  }
  
  init() {
    // First Contentful Paint
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint')
      if (fcpEntry) {
        this.metrics.fcp = fcpEntry.startTime
        console.log('[Performance] FCP:', fcpEntry.startTime.toFixed(2), 'ms')
      }
    }).observe({ entryTypes: ['paint'] })
    
    // Largest Contentful Paint
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      const lastEntry = entries[entries.length - 1]
      this.metrics.lcp = lastEntry.startTime
      console.log('[Performance] LCP:', lastEntry.startTime.toFixed(2), 'ms')
    }).observe({ entryTypes: ['largest-contentful-paint'] })
    
    // First Input Delay
    new PerformanceObserver((entryList) => {
      entryList.getEntries().forEach((entry) => {
        if (entry.entryType === 'first-input') {
          this.metrics.fid = entry.processingStart - entry.startTime
          console.log('[Performance] FID:', this.metrics.fid.toFixed(2), 'ms')
        }
      })
    }).observe({ entryTypes: ['first-input'] })
    
    // Cumulative Layout Shift
    new PerformanceObserver((entryList) => {
      entryList.getEntries().forEach((entry) => {
        if (!entry.hadRecentInput) {
          this.metrics.cls += entry.value
          console.log('[Performance] CLS:', this.metrics.cls.toFixed(4))
        }
      })
    }).observe({ entryTypes: ['layout-shift'] })
  }
  
  getMetrics() {
    return this.metrics
  }
  
  report() {
    console.log('[Performance Metrics]', this.metrics)
    // Send to analytics service
    // navigator.sendBeacon('/api/performance', JSON.stringify(this.metrics))
  }
}

export const performanceMonitor = new PerformanceMonitor()
`
  
  const hooksDir = join(CLIENT_DIR, 'src', 'hooks')
  if (!existsSync(hooksDir)) {
    mkdirSync(hooksDir, { recursive: true })
  }
  
  writeFileSync(join(hooksDir, 'usePerformance.js'), monitoringCode)
  log('Performance monitoring hook created at src/hooks/usePerformance.js', 'green')
}

// Optimize Vite config
function optimizeViteConfig() {
  log('\n⚙️  Optimizing Vite configuration...', 'cyan')
  
  const optimizedConfig = `// client/vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
    // Optimize dev server
    warmup: {
      clientFiles: [
        './index.html',
        './src/main.jsx',
        './src/App.jsx',
      ],
    },
  },
  build: {
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
      },
    },
    // Enable sourcemaps for debugging
    sourcemap: false, // Set to true for debugging
    // Chunk size optimization
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'utils': ['axios', 'date-fns', 'clsx'],
          'ui': ['framer-motion', '@heroicons/react', '@headlessui/react'],
          'charts': ['chart.js', 'react-chartjs-2'],
          'emoji': ['emoji-mart', '@emoji-mart/data', '@emoji-mart/react'],
          'media': ['howler', 'simple-peer'],
          'realtime': ['socket.io-client', 'react-use-websocket'],
          'state': ['zustand'],
          'ai': ['@google/generative-ai'],
          'payments': ['@stripe/react-stripe-js', '@stripe/stripe-js'],
        },
        // Optimize chunk naming
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash][extname]',
      },
    },
    // Target modern browsers
    target: 'esnext',
    // CSS code splitting
    cssCodeSplit: true,
    // Asset size limit
    assetsInlineLimit: 4096, // 4kb
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'axios',
      'framer-motion',
      'zustand',
    ],
    exclude: ['@emoji-mart/data'],
  },
  // Enable source maps for debugging
  esbuild: {
    sourcemap: false,
  },
});
`
  
  const backupPath = join(CLIENT_DIR, 'vite.config.js.backup')
  if (!existsSync(backupPath)) {
    const currentConfig = readFileSync(join(CLIENT_DIR, 'vite.config.js'))
    writeFileSync(backupPath, currentConfig)
    log('Backed up current vite.config.js to vite.config.js.backup', 'green')
  }
  
  writeFileSync(join(CLIENT_DIR, 'vite.config.optimized.js'), optimizedConfig)
  log('Optimized config saved to vite.config.optimized.js', 'green')
  log('Review and replace vite.config.js if satisfied', 'yellow')
}

// Main menu
function showMenu() {
  log('\n' + '='.repeat(50), 'cyan')
  log('  GBChat Performance Optimization Tools', 'magenta')
  log('='.repeat(50), 'cyan')
  log('\nSelect an option:\n', 'yellow')
  log('1. Clean caches and temp files', 'cyan')
  log('2. Analyze bundle size', 'cyan')
  log('3. Optimize images', 'cyan')
  log('4. Generate performance report', 'cyan')
  log('5. Setup performance monitoring', 'cyan')
  log('6. Optimize Vite configuration', 'cyan')
  log('7. Run all optimizations', 'cyan')
  log('0. Exit', 'cyan')
  log('')
}

function runAll() {
  log('\n🚀 Running all optimizations...\n', 'magenta')
  cleanCaches()
  generatePerformanceReport()
  setupPerformanceMonitoring()
  optimizeViteConfig()
  
  log('\n' + '='.repeat(50), 'green')
  log('  All optimizations completed!', 'green')
  log('='.repeat(50), 'green')
  log('\nNext steps:', 'yellow')
  log('1. Review vite.config.optimized.js and replace if satisfied', 'cyan')
  log('2. Run "npm run build" to build with optimizations', 'cyan')
  log('3. Check performance-report.json for recommendations', 'cyan')
}

// Parse command line arguments
const args = process.argv.slice(2)
const command = args[0]

switch (command) {
  case 'clean':
    cleanCaches()
    break
  case 'analyze':
    analyzeBundle()
    break
  case 'images':
    optimizeImages()
    break
  case 'report':
    generatePerformanceReport()
    break
  case 'monitor':
    setupPerformanceMonitoring()
    break
  case 'optimize':
    optimizeViteConfig()
    break
  case 'all':
    runAll()
    break
  default:
    showMenu()
    // Interactive mode would go here
    log('Usage: npm run optimize [command]', 'yellow')
    log('\nCommands:', 'yellow')
    log('  clean    - Clean caches and temp files', 'cyan')
    log('  analyze  - Analyze bundle size', 'cyan')
    log('  images   - Optimize images', 'cyan')
    log('  report   - Generate performance report', 'cyan')
    log('  monitor  - Setup performance monitoring', 'cyan')
    log('  optimize - Optimize Vite configuration', 'cyan')
    log('  all      - Run all optimizations', 'cyan')
}
