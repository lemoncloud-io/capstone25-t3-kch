// Environment configuration for the application
export const config = {
    // Use mock data when backend is unavailable or for development
    // Set to false when connecting to real backend API
    USE_MOCK_DATA: import.meta.env.VITE_USE_MOCK_DATA === 'true' || import.meta.env.VITE_USE_MOCK_DATA === undefined,

    // API base URL (used when USE_MOCK_DATA is false)
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
} as const
