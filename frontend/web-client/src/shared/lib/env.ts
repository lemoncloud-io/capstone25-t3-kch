interface ImportMetaEnv {
    readonly VITE_APP_VERSION: string
    readonly VITE_API_BASE_URL: string
    readonly VITE_ENV: string
    readonly VITE_USE_SERVER?: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}

export const env = {
    APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
    ENV: import.meta.env.VITE_ENV || 'development',
    USE_SERVER: (import.meta.env.VITE_USE_SERVER || 'false') === 'true',
    S3_PUBLIC_BASE: import.meta.env.VITE_S3_PUBLIC_BASE as string | undefined,
} as const

export const isDev = import.meta.env.DEV
export const isProd = import.meta.env.PROD
