import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from '@/shared/components/ui/sonner'
import { App } from './App'
import './index.css'

// 환경변수
console.log('=== Frontend Environment Variables ===')
console.log('VITE_APP_VERSION:', import.meta.env.VITE_APP_VERSION || 'not set')
console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL || 'not set')
console.log('VITE_ENV:', import.meta.env.VITE_ENV || 'not set')
console.log('NODE_ENV:', import.meta.env.MODE || 'not set')
console.log('=====================================')

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5,
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <BrowserRouter>
            <QueryClientProvider client={queryClient}>
                <App />
                <Toaster />
                <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
        </BrowserRouter>
    </React.StrictMode>
)
