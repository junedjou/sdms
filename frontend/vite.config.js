import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon-192.svg', 'icon-512.svg', 'icon-maskable.svg'],

      // Manifest sudah ada di public/manifest.json, tapi kita juga definisikan
      // di sini agar plugin bisa generate service worker dengan benar
      manifest: {
        name: 'SDMS — School Data Management System',
        short_name: 'SDMS',
        description: 'Platform terpadu pengelolaan data akademik sekolah.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait-primary',
        background_color: '#ffffff',
        theme_color: '#6366f1',
        lang: 'id',
        icons: [
          { src: '/icon-192.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any' },
          { src: '/icon-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any' },
          { src: '/icon-maskable.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'maskable' },
        ],
        shortcuts: [
          { name: 'Dashboard', url: '/dashboard', icons: [{ src: '/icon-192.svg', sizes: '192x192' }] },
          { name: 'App Hub',   url: '/app-hub',   icons: [{ src: '/icon-192.svg', sizes: '192x192' }] },
        ],
      },

      workbox: {
        // Cache halaman utama & aset statis
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        // Jangan cache request API
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/],
        runtimeCaching: [
          {
            // Cache API settings (agar offline bisa lihat setting)
            urlPattern: /^https:\/\/sdms\.smkn1kras\.sch\.id\/api\/v1\/settings/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'sdms-settings',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 }, // 1 hari
            },
          },
        ],
      },

      devOptions: {
        enabled: false, // aktifkan jadi true saat dev testing PWA
      },
    }),
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          charts: ['chart.js', 'vue-chartjs'],
        },
      },
    },
  },
});
