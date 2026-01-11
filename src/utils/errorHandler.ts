/**
 * Error handling utilities for API calls
 */

export interface ErrorResponse {
  message: string;
  userMessage: string;
  statusCode?: number;
  isServerError: boolean;
  isNetworkError: boolean;
}

/**
 * Parse API error and return user-friendly message
 */
export function parseApiError(error: any): ErrorResponse {
  // Network error (no response from server)
  if (!error.response) {
    return {
      message: error.message || 'Network error',
      userMessage: 'Unable to connect to server. Please check your internet connection.',
      isServerError: false,
      isNetworkError: true,
    };
  }

  const statusCode = error.response?.status;
  const serverMessage = error.response?.data?.message || error.message;

  // Map status codes to user-friendly messages
  let userMessage: string;
  let isServerError = false;

  switch (statusCode) {
    case 400:
      userMessage = 'Invalid request. Please try again.';
      break;
    case 401:
      userMessage = 'Please log in to continue.';
      break;
    case 403:
      userMessage = 'You do not have permission to access this resource.';
      break;
    case 404:
      userMessage = 'The requested resource was not found.';
      break;
    case 500:
      userMessage = 'Server error. Please try again later.';
      isServerError = true;
      break;
    case 502:
    case 503:
    case 504:
      userMessage = 'Service temporarily unavailable. Please try again later.';
      isServerError = true;
      break;
    default:
      userMessage = 'Something went wrong. Please try again.';
      isServerError = statusCode >= 500;
  }

  return {
    message: serverMessage,
    userMessage,
    statusCode,
    isServerError,
    isNetworkError: false,
  };
}

/**
 * Log error for debugging (can be extended to send to error tracking service)
 */
export function logError(context: string, error: any): void {
  const errorInfo = parseApiError(error);
  
  console.error(`[${context}] Error:`, {
    message: errorInfo.message,
    statusCode: errorInfo.statusCode,
    isServerError: errorInfo.isServerError,
    isNetworkError: errorInfo.isNetworkError,
    timestamp: new Date().toISOString(),
  });

  // TODO: Send to error tracking service (e.g., Sentry)
  // if (errorInfo.isServerError) {
  //   sendToErrorTracking(context, error);
  // }
}

/**
 * Get user-friendly error message for rankings
 */
export function getRankingErrorMessage(error: any): string {
  const { isServerError, isNetworkError, userMessage } = parseApiError(error);

  if (isServerError) {
    return 'Rankings are temporarily unavailable. Please try again later.';
  }

  if (isNetworkError) {
    return 'Unable to load rankings. Please check your connection.';
  }

  return userMessage;
}
