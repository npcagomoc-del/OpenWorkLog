import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig({
  build: { rollupOptions: { output: { manualChunks: {
    'react-vendor': ['react', 'react-dom', 'react-router-dom'],
    'storage-vendor': ['dexie', 'dexie-react-hooks'],
    'validation-vendor': ['zod'],
  } } } },
  plugins: [react(), VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['favicon.svg', 'icon-192.png', 'icon-512.png'],
    manifest: {
      name: 'OpenWorkLog', short_name: 'WorkLog',
      description: 'A private offline workspace for your day.',
      theme_color: '#176b50', background_color: '#f7f8fa',
      display: 'standalone', start_url: '.',
      icons: [
        { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      ],
    },
    workbox: { globPatterns: ['**/*.{js,css,html,svg,png,woff2}'], maximumFileSizeToCacheInBytes: 4000000 },
  })],
});
