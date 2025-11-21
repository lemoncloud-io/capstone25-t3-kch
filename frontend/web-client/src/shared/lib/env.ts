export const env = {
    ENV: import.meta.env.MODE || 'development',
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
    USE_SERVER: true, // 강제로 백엔드 연동 활성화
    S3_PUBLIC_BASE: import.meta.env.VITE_S3_PUBLIC_BASE || 'https://youth-policy-thumbnails-kch.s3.ap-northeast-2.amazonaws.com/',
    ADMIN_PASSWORD: import.meta.env.VITE_ADMIN_PASSWORD || 'admin'
}