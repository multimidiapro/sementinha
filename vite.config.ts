import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // App instalável e sem internet: o aparelho guarda uma cópia do app (telas, letras, jogos).
    // Os vídeos próprios ficam guardados à parte (IndexedDB). YouTube só com internet.
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icone.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Sementinha',
        short_name: 'Sementinha',
        description: 'Plataforma infantil gratuita e de código aberto, com controle dos pais.',
        lang: 'pt-BR',
        start_url: '/',
        scope: '/',
        display: 'fullscreen',
        orientation: 'any',
        background_color: '#eaf3de',
        theme_color: '#eaf3de',
        icons: [
          { src: '/icone-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icone-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icone-mascara-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,woff2,png,svg}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
