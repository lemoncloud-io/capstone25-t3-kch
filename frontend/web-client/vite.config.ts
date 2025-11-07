import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        host: true, // 동일 네트워크의 모바일 기기에서 접속 가능하도록
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    'react-vendor': ['react', 'react-dom', 'react-router-dom'],
                    query: ['@tanstack/react-query', 'axios'],
                    ui: ['lucide-react', 'clsx', 'tailwind-merge'],
                },
            },
        },
    },
})
