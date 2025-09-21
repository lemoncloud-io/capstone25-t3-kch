interface ImportMetaEnv {
    readonly VITE_APP_VERSION: string
    readonly VITE_API_BASE_URL: string
    readonly VITE_ENV: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}

export const env = {
    APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
    ENV: import.meta.env.VITE_ENV || 'development',
} as const

export const isDev = import.meta.env.DEV
export const isProd = import.meta.env.PROD