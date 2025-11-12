import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar React e ReactDOM em um chunk próprio
          react: ['react', 'react-dom'],
          // Separar ícones em chunks separados
          'lucide-icons': ['lucide-react'],
          'country-flags': ['country-flag-icons'],
          // Separar bibliotecas de UI/utilitários
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
    chunkSizeWarningLimit: 600, // Ajustar o limite de aviso
  },
  server: {
    host: true,
    allowedHosts: [
      '9d1b6c4aef5b.ngrok-free.app',
      '.ngrok-free.app',
      '.ngrok.io',
    ],
  },
});
