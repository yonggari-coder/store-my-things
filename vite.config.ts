import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/icon.svg', 'icons/icon-maskable.svg'],
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
      },
      manifest: {
        id: '/',
        name: 'Where Is My Phone',
        short_name: 'WIMP',
        description: '내 공간(집·사무실 등)에 둔 물건 위치를 2D 격자로 기록·검색',
        lang: 'ko',
        dir: 'ltr',
        theme_color: '#fafafa',
        background_color: '#fafafa',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/icons/icon.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: '/icons/icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: '/icons/icon-maskable.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
})
