/**
 * Safely extracts error message from unknown error types
 * @param error - Error from catch block or mutation failure
 * @returns Human-readable error message
 */
export const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
        return error.message
    }

    if (typeof error === 'string') {
        return error
    }

    if (error && typeof error === 'object' && 'message' in error) {
        return String(error.message)
    }

    return 'An unknown error occurred'
}
