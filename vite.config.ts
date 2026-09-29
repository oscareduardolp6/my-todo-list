import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // `VITE_BASE=/mi-repo/` al publicar en GitHub Pages; en local y en un
  // dominio propio se queda en la raíz.
  base: process.env.VITE_BASE ?? '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/favicon-48.png', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'Tareas',
        short_name: 'Tareas',
        description: 'Mi lista de tareas personal, sincronizada entre dispositivos.',
        lang: 'es-MX',
        display: 'standalone',
        orientation: 'portrait-primary',
        background_color: '#0f1115',
        theme_color: '#0f1115',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/maskable-icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2}'],
        navigateFallback: 'index.html',
        // El handler de login de Firebase vive en `/__/auth/` del authDomain,
        // nunca debe caer en el fallback de la SPA.
        navigateFallbackDenylist: [/^\/__\//],
      },
    }),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: process.env.PORT ? { port: Number(process.env.PORT), strictPort: true } : undefined,
});
