import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
      allowedHosts: ['nikki-acidic-stoopingly.ngrok-free.dev'],
    proxy: {
      '/graphql': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        secure: false,
        ws: true,
      }
    }
  }
})