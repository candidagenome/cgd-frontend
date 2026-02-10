import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['frontend.dev.candidagenome.org'],
    proxy: {
      '/api': {
        target: 'https://backend.dev.candidagenome.org',
        changeOrigin: true,
        secure: true,
        // Ensure cookies are properly forwarded
        cookieDomainRewrite: {
          'backend.dev.candidagenome.org': 'frontend.dev.candidagenome.org',
        },
      },
      '/cgi-bin': {
        target: 'https://www.candidagenome.org',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
