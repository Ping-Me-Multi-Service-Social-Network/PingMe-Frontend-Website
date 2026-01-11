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

interface ApiError {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
  message?: string;
}

/**
 * Parse API error and return user-friendly message
 */
export function parseApiError(error: unknown): ErrorResponse {
  const apiError = error as ApiError;
  // Network error (no response from server)
  if (!apiError.response) {
    return {
      message: apiError.message || "Lỗi mạng",
      userMessage:
        "Không thể kết nối với máy chủ. Vui lòng kiểm tra kết nối internet của bạn.",
      isServerError: false,
      isNetworkError: true,
    };
  }

  const statusCode = apiError.response?.status;
  const serverMessage = apiError.response?.data?.message || apiError.message;

  // Map status codes to user-friendly messages
  let userMessage: string;
  let isServerError = false;

  switch (statusCode) {
    case 400:
      userMessage = "Yêu cầu không hợp lệ. Vui lòng thử lại.";
      break;
    case 401:
      userMessage = "Vui lòng đăng nhập để tiếp tục.";
      break;
    case 403:
      userMessage = "Bạn không có quyền truy cập tài nguyên này.";
      break;
    case 404:
      userMessage = "Không tìm thấy tài nguyên được yêu cầu.";
      break;
    case 500:
      userMessage = "Lỗi máy chủ. Vui lòng thử lại sau.";
      isServerError = true;
      break;
    case 502:
    case 503:
    case 504:
      userMessage = "Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau.";
      isServerError = true;
      break;
    default:
      userMessage = "Đã xảy ra lỗi. Vui lòng thử lại.";
      isServerError = statusCode !== undefined && statusCode >= 500;
  }

  return {
    message: serverMessage || "Lỗi không xác định",
    userMessage,
    statusCode,
    isServerError,
    isNetworkError: false,
  };
}

/**
 * Log error for debugging (can be extended to send to error tracking service)
 */
export function logError(context: string, error: unknown): void {
  const errorInfo = parseApiError(error);

  console.error(`[${context}] Error:`, {
    message: errorInfo.message,
    statusCode: errorInfo.statusCode,
    isServerError: errorInfo.isServerError,
    isNetworkError: errorInfo.isNetworkError,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Get user-friendly error message for rankings
 */
export function getRankingErrorMessage(error: unknown): string {
  const { isServerError, isNetworkError, userMessage } = parseApiError(error);

  if (isServerError) {
    return "Bảng xếp hạng tạm thời không khả dụng. Vui lòng thử lại sau.";
  }

  if (isNetworkError) {
    return "Không thể tải bảng xếp hạng. Vui lòng kiểm tra kết nối của bạn.";
  }

  return userMessage;
}
